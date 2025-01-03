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

const keyPrice = 'price2'

// https://www.cardmarket.com/en/OnePiece/Wants/19689401

const eurToFloat = s => parseFloat(s.replace(/^.*?(\d+),(\d+).*?$/, '$1.$2'))
const nameToCard = s => s.replace(/^.*?\((.*?)\).*$/, '$1')

const urlParams = new URLSearchParams(window.location.search)
const idWantslist = urlParams.get('idWantslist')
console.log(idWantslist)

/*$.get( "https://api.cardmarket.com/ws/v2.0/wantslist/" + idWantslist, function( data ) {
  alert( data );
})*/

// get wants list information
$.get( "https://www.cardmarket.com/en/OnePiece/Wants/" + idWantslist, function( data ) {
    let wantsList = []
    $(data).find('#WantsListTable table tbody tr').each(function( index ) {
        const name = nameToCard($(this).find('.name a').text())
        const amount = parseInt($(this).find('.amount').text())
        wantsList[name] = amount
    })
    console.log(wantsList)

    let sum = 0, totalAmount = 0
    $('#UserOffersTable .table-body div[id^=articleRow]').each(function( index ) {
        // add amount
        const name = nameToCard($(this).find('.col-seller').text())
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
        $.ajax({
            url: url,
            success: function (data) {
                prices[url] = {
                    priceFrom: $(data).find('.info-list-container dl > dd:nth-child(12)').text(),
                    amountAvailable: parseInt($(data).find('.info-list-container dl > dd:nth-child(10)').text()),
                    name: nameToCard($(data).find(".page-title-container h1").clone().children().remove().end().text()),
                }
                setCachedObject(keyPrice, prices)
                addPriceInformation(row, prices[url])
            },
            async: false
        })
    }
})

function addPriceInformation(row, price) {
    row.find('.price-container > div').append(`<span class="small">(${price.priceFrom})</span>`)
    //row.find('.amount-container').append(`&#8202;<span class="small">(${price.amountAvailable})</span>`)
}
