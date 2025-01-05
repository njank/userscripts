// ==UserScript==
// @name         OP Cardmarket
// @description  OP Cardmarket
// @namespace    njank
// @version      0.0.1
// @author       njank
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @match        https://www.cardmarket.com/en/OnePiece/Users/*/Offers/Singles?idWantslist=*
// @match        https://www.cardmarket.com/en/OnePiece/Wants/*
// @require      http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

function getCachedObject(cachedKey, fallback={}) {
    let obj = GM_getValue(cachedKey)
    if(obj === undefined)
        return fallback
    return JSON.parse(obj)
}

function setCachedObject(cachedKey, obj) {
    GM_setValue(cachedKey, JSON.stringify(obj))
}

const keyPrice = 'price6'

const eurToFloat = s => parseFloat(s.replace(/^.*?(\d+),(\d+).*?$/, '$1.$2'))
const nameToId = s => s.replace(/^.*?\((.*?)\).*$/, '$1')
const urlParams = new URLSearchParams(window.location.search)

if(window.location.pathname.indexOf('/Users/')) {
    const idWantslist = urlParams.get('idWantslist')
    console.log(idWantslist)

    /*$.get( "https://api.cardmarket.com/ws/v2.0/wantslist/" + idWantslist, function( data ) {
        alert( data );
    })*/

    // get wants list information
    $.get( "https://www.cardmarket.com/en/OnePiece/Wants/" + idWantslist, function( data ) {
        let wantsList = []
        $(data).find('#WantsListTable table tbody tr').each(function( index ) {
            const name = nameToId($(this).find('.name a').text())
            const amount = parseInt($(this).find('.amount').text())
            wantsList[name] = amount
        })
        console.log(wantsList)

        let sum = 0, totalAmount = 0
        $('#UserOffersTable .table-body div[id^=articleRow]').each(function( index ) {
            // add amount
            const name = nameToId($(this).find('.col-seller').text())
            $(this).find('.col-offer').prepend(wantsList[name])

            // calc sum
            const priceSeller = eurToFloat($(this).find('.col-offer .price-container').text())
            const amountSeller = parseInt($(this).find('.col-offer .amount-container .item-count').text())
            const amountNeededAndAvailable = Math.min(amountSeller, wantsList[name])
            //console.log(name, wantsList[name], amountSeller, amountNeededAndAvailable)

            sum += priceSeller * amountNeededAndAvailable
            totalAmount += amountNeededAndAvailable

            // select max amount
            $(this).find('select[name^=amount]').val(amountNeededAndAvailable)
        })

        $('#UserOffersTable .table-header .col-offer').prepend(`${totalAmount} pcs ${Math.round(sum*100)/100} € / `)
    })

    $('#UserOffersTable .table-body div[id^=articleRow]').each(function(index) {
        const row = $(this)

        // get best price information
        var prices = getCachedObject(keyPrice)
        console.log(prices)
        const url = row.find('.col-seller a').attr('href')

        if (url in prices) {
            addPriceInformation(row, prices[url])
            console.log('was cached: ' + url)
        } else {
            getPrice(url, function(price){
                prices[url] = price
                setCachedObject(keyPrice, prices)
                addPriceInformation(row, prices[url])
            }, function(error) { console.log(error) })
        }
    })

    function addPriceInformation(row, price) {
        row.find('.price-container > div').append(`<span class="small">(${price.priceFrom})</span>`)
        //row.find('.amount-container').append(`&#8202;<span class="small">(${price.amountAvailable})</span>`)
    }
}

/*** MY LIST ***/
// https://www.cardmarket.com/en/OnePiece/Wants/19689401
if(window.location.pathname.indexOf('/Wants/')) {
    $('.container > div:nth-child(4) > div:nth-child(2)').append($('<a role="button" class="btn btn-outline-success ms-lg-3 mt-2 mt-lg-0">Load</a>').click(function() {
        console.log('load prices')
        let prices = getCachedObject(keyPrice)

        // identify prices that are not cached yet
        $('table tbody tr').each(function() {
            if($(this).find('td.name > a').attr('href')) {
                const id = nameToId($(this).find('td.name > a').text())
                console.log(id)
                if (!prices.hasOwnProperty(id))
                    prices[id] = 'to load'
                else
                    addPriceInformation2(id, prices[id])
                    console.log(prices[id])
            }
        })
        console.log(prices)

        // get needed prices
        for (var id in prices){
            if(prices.hasOwnProperty(id) && prices[id] === 'to load')
                getPrice2(id, function(price){
                    prices[id] = price
                    setCachedObject(keyPrice, prices)
                    addPriceInformation2(id, prices[id])
                }, function(error) { console.log(error) })
        }
        console.log(prices)
        $('td').removeClass('min-size')
        $('th.buyPrice').removeClass('min-size')

    }))
    $('.container > div:nth-child(4) > div:nth-child(2)').append($('<a role="button" class="btn btn-outline-danger ms-lg-3 mt-2 mt-lg-0">Delete</a>').click(function() {
        console.log('delete prices')
        setCachedObject(keyPrice, {})
        // todo delete ui
    }))
}

function addPriceInformation2(id, prices) {
    $('table tbody tr').filter(function() {
        return $(this).find('.name').text().indexOf('(' + id + ')') > 0
    }).find('td.buyPrice').empty().append($('<div><span>' + prices.map(p => (
        '<b style="color:green">' + p.price + '</b>'
        + ' (' + p.amountAvailable + ')'
        + (p.print ? ' ' + p.print + p.name.replace(/^.*?(\(V\.\d+\))?$/g, '$1') : '')
    )).join('</span><br><span>') + '</span></div>'))
}

function getPrice2(id, callbackSuccess, callbackError, async = false) {
    console.log('getPrice2: ' + id)
    $.ajax({
        url: '/en/OnePiece/Products/Search?searchString=' + id,
        success: function (data) {
            let prices = []
            if($(data).find('.page-title-container h1').length === 0) { // multiple
                $(data).find('.table > .table-body > div[id^=productRow]').each(function() {
                    prices.push({
                        print: $(this).find('>div:nth-child(3)').text(),
                        name: $(this).find('>div:nth-child(4) a').text(),
                        price: eurToFloat($(this).find('div.col-price').text()),
                        amountAvailable: parseInt($(this).find('div.col-availability').text()),
                    })
                })
            } else { // single
                prices.push({
                    print: undefined, // only long version available
                    name: $(data).find('.page-title-container h1').clone().children().remove().end().text(),
                    price: eurToFloat($(data).find('.info-list-container dl > dd:nth-child(10)').text()),
                    amountAvailable: parseInt($(data).find('.info-list-container dl > dd:nth-child(8)').text()),
                })
            }
            callbackSuccess(prices)
        },
        error: function (error) { callbackError(error) },
        async: false
    })
}

function getPrice(url, callbackSuccess, callbackError, async = false) {
    console.log('getPrice: ' + url)
    $.ajax({
        url: url,
        success: function (data) {
            callbackSuccess({
                priceFrom: $(data).find('.info-list-container dl > dd:nth-child(12)').text(),
                amountAvailable: parseInt($(data).find('.info-list-container dl > dd:nth-child(10)').text()),
                name: nameToId($(data).find('.page-title-container h1').clone().children().remove().end().text()),
            })
        },
        error: function (error) { callbackError(error.status) },
        async: false
    })
}
