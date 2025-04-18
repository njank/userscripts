// ==UserScript==
// @name         OP Cardmarket
// @description  OP Cardmarket
// @namespace    njank
// @version      0.0.5
// @author       njank
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @match        https://www.cardmarket.com/*/OnePiece/*
// @require      http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

/* PARAM */
const urlGoogleSheets = 'https://script.googleusercontent.com/macros/echo?user_content_key=xxx'
const keyPrice = 'price6'

/* FUNCTIONS */
function getCachedObject(cachedKey, fallback={}) {
    let obj = GM_getValue(cachedKey)
    if(obj === undefined)
        return fallback
    return JSON.parse(obj)
}

function setCachedObject(cachedKey, obj) {
    GM_setValue(cachedKey, JSON.stringify(obj))
}

const eurToFloat = s => parseFloat(s.replace(/^.*?(\d+),(\d+).*?$/, '$1.$2'))
const nameToId = s => s.replace(/^.*\(([A-Z0-9-]+)\).*?$/, '$1')
const urlParams = new URLSearchParams(window.location.search)
const langToCode = str => ({Japanese:'jp',English:'en',French:'fr','S-Chinese':'cn'})[str] || str.toLowerCase().slice(0,2)
const getSum = (stash, id, lang) => stash.filter(s => s[1] === id && (!lang || s[4] === lang)).reduce((sum, s) => sum + (+s[0] || 0), 0)

// get stash
async function fetchStash() {
    const data = await $.get(urlGoogleSheets)
    return data.values
}

// get shopping cart
async function fetchCart() {
    let cart = []
    const user = window.location.pathname.replace(/^.*\/Users\/([^\/]+)\/.*$/, '$1')
    const data = await $.get("/en/OnePiece/ShoppingCart")

    $(data).find(`#shipments-col .card-body a:contains("${user}")`)
        .closest('.card-body')
        .find('table[id^="ArticleTable"] tbody tr')
        .each(function() {
        const id = nameToId($(this).attr('data-name'))
        const amount = parseInt($(this).find('.amount').attr('data-amount'))
        cart[id] = (id in cart ? cart[id] : 0) + amount
    })
    return cart
}

// get wants list information
async function fetchWantsList(idWantslist) {
    let wantsList = []
    const data = await $.get(`/en/OnePiece/Wants/${idWantslist}`)

    $(data).find('#WantsListTable table tbody tr').each(function() {
        const id = nameToId($(this).find('.name a').text())
        const amount = parseInt($(this).find('.amount').text())
        wantsList[id] = amount
    })
    return wantsList
}

function addPriceInformationForSiteUsers(id, prices, priceCompare) {
    const rows = $('#UserOffersTable .table-body div[id^=articleRow]').filter(function() {
        return $(this).find('.col-seller').text().indexOf('(' + id + ')') > 0
    })
    rows.find('.product-comments, .prices').remove()
    rows.find('.product-attributes').append($('<div class="prices small"><span>' + prices.map(p => (
        '<b style="color:' + (p.price <= priceCompare ? 'green' : 'red') + '">' + p.price + '</b>'
        + ' (' + p.amountAvailable + ')'
        + (p.print ? ' ' + p.print + p.name.replace(/^.*?(\(V\.\d+\))?$/g, '$1') : '')
    )).join('</span><br><span>') + '</span></div>'))
}

function addPriceInformationForSiteWants(id, prices) {
    $('table tbody tr').filter(function() {
        return $(this).find('.name').text().indexOf('(' + id + ')') > 0
    }).find('td.buyPrice').empty().append($('<div><span>' + prices.map(p => (
        '<b style="color:green">' + p.price + '</b>'
        + ' (' + p.amountAvailable + ')'
        + (p.print ? ' ' + p.print + p.name.replace(/^.*?(\(V\.\d+\))?$/g, '$1') : '')
    )).join('</span><br><span>') + '</span></div>'))
}

function getPrices(callback) {
    let prices = getCachedObject(keyPrice)
    for (var id in prices){
        if(prices.hasOwnProperty(id) && prices[id] === 'to load')
            getPriceById(id, function(price){
                prices[id] = price
                setCachedObject(keyPrice, prices)
                callback(id, prices[id])
            }, function(error) { console.log(error) })
    }
}

function getPriceById(id, callbackSuccess, callbackError, async = false) {
    console.log('getPriceById: ' + id)
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

function getPriceByUrl(url, callbackSuccess, callbackError, async = false) {
    console.log('getPriceByUrl: ' + url)
    $.ajax({
        url: url,
        success: function (data) {
            callbackSuccess({
                name: nameToId($(data).find('.page-title-container h1').clone().children().remove().end().text()),
                price: $(data).find('.info-list-container dl > dd:nth-child(12)').text(),
                amountAvailable: parseInt($(data).find('.info-list-container dl > dd:nth-child(10)').text()),
            })
        },
        error: function (error) { callbackError(error.status) },
        async: false
    })
}

function showAlert(type, message, duration = 5000) { // ['primary', 'success', 'danger', 'warning', 'info']
    const getIcon = (type) => { switch(type) { case 'success': return 'check-circle'; case 'danger': return 'cross-circle'; default: return type; } };
    const $alert = $(`
    <div role="alert" class="alert systemMessage alert-${type} alert-dismissible fade show">
      <span class="fonticon-${getIcon(type)} alert-icon"></span>
      <button type="button" data-bs-dismiss="alert" aria-label="Close" class="btn-close"></button>
      <div class="alert-content">
        <h4 class="alert-heading">${message}</h4>
      </div>
    </div>
    `).appendTo('#AlertContainer')

    if (duration > 0)
        setTimeout(() => {
            $alert.alert('close')
        }, duration)
}

/*** OFFERS ***/
if(window.location.pathname.indexOf('/Offers/Singles/')) {
    // PRICES
    $('#collapsibleExtraFilters .row').append($('<a role="button" class="btn btn-outline-success form-group col-12 mb-2 col-md-2 col-xl-1">Load</a>').click(function() {
        console.log('load prices')
        let prices = getCachedObject(keyPrice)

        // identify prices that are not cached yet
        $('#UserOffersTable .table-body div[id^=articleRow]').each(function() {
            if($(this).find('.col-seller').text()) {
                const id = nameToId($(this).find('.col-seller').text())
                console.log(id)
                if (id && !prices.hasOwnProperty(id) || prices[id] === 'to load')
                    prices[id] = 'to load'
                else
                    addPriceInformationForSiteUsers(id, prices[id], eurToFloat($(this).find('.col-offer .price-container').text()))
                console.log(prices[id])
            }
        })
        setCachedObject(keyPrice, prices)

        // get needed prices
        getPrices(addPriceInformationForSiteUsers)

        console.log(prices)
    }))

    $('#collapsibleExtraFilters .row').append($('<a role="button" class="btn btn-outline-danger form-group col-12 mb-2 col-md-2 col-xl-1">Delete</a>').click(function() {
        console.log('delete prices')
        setCachedObject(keyPrice, {})
        // todo delete ui
    }))

    // GET COUNT FROM WANTS SITE
    const idWantslist = urlParams.get('idWantslist')
    if(idWantslist) {
        console.log(idWantslist)

        ;(async () => {
            try {
                const wantsList = await fetchWantsList(idWantslist)

                let sum = 0, totalAmount = 0
                $('#UserOffersTable .table-body div[id^=articleRow]').each(function( index ) {
                    // add amount
                    const id = nameToId($(this).find('.col-seller').text())
                    $(this).find('.product-attributes').append(`<span><span class="fonticon-wants icon is-16x16"></span>${wantsList[id]}&nbsp;</span>`)

                    // calc sum
                    const priceSeller = eurToFloat($(this).find('.col-offer .price-container').text())
                    const amountSeller = parseInt($(this).find('.col-offer .amount-container .item-count').text())
                    const amountNeededAndAvailable = Math.min(amountSeller, wantsList[id])
                    //console.log(id, wantsList[id], amountSeller, amountNeededAndAvailable)

                    sum += priceSeller * amountNeededAndAvailable
                    totalAmount += amountNeededAndAvailable

                    // select max amount
                    $(this).find('select[name^=amount]').val(amountNeededAndAvailable)
                })

                $('#UserOffersTable .table-header .col-offer').prepend(`${totalAmount} pcs ${Math.round(sum*100)/100} € / `) // header


            } catch (error) {
                console.error(error)
            }
        })()

        ;(async () => {
            try {
                const cart = await fetchCart()

                $('#UserOffersTable .table-body div[id^=articleRow]').each(function( index ) {
                    // add amount
                    const id = nameToId($(this).find('.col-seller').text())
                    if(id in cart)
                        $(this).find('.product-attributes').append(`<span><span class="fonticon-cart icon is-16x16"></span>${cart[id]}&nbsp;</span>`)
                })
            } catch (error) {
                console.error(error)
            }
        })()

        ;(async () => {
            try {
                const stash = await fetchStash()

                $('#UserOffersTable .table-body div[id^=articleRow]').each(function( index ) {
                    // add amount
                    const id = nameToId($(this).find('.col-seller').text())
                    const lang = langToCode($(this).find('.product-attributes>.icon').attr('aria-label'))
                    const countStash = getSum(stash, id, lang)
                    const countStashAllLang = getSum(stash, id, undefined)
                    const countStashAllLangAbbr = countStashAllLang > countStash ? ' (<abbr title="Same card in all languages">'+countStashAllLang+'</abbr>)' : ''

                    if(countStash > 0 || countStashAllLang > 0)
                        $(this).find('.product-attributes').append(`<span><span class="fonticon-offers icon is-16x16"></span>${countStash}${countStashAllLangAbbr}&nbsp;</span>`)
                })
            } catch (error) {
                console.error(error)
            }
        })()

    }
}

/*** MY LIST ***/
if(window.location.pathname.indexOf('/Wants/')) {
    // PRICES
    $('.container > div:nth-child(4) > div:nth-child(2)').append($('<a role="button" class="btn btn-outline-success ms-lg-3 mt-2 mt-lg-0">Load</a>').click(function() {
        console.log('load prices')
        let prices = getCachedObject(keyPrice)

        // identify prices that are not cached yet
        $('table tbody tr').each(function() {
            if($(this).find('td.name > a').text()) {
                const id = nameToId($(this).find('td.name > a').text())
                console.log(id)
                if (!prices.hasOwnProperty(id) || prices[id] === 'to load')
                    prices[id] = 'to load'
                else
                    addPriceInformationForSiteWants(id, prices[id])
            }
        })
        setCachedObject(keyPrice, prices)

        // get needed prices
        getPrices(addPriceInformationForSiteWants)
        console.log(prices)

        $('td').removeClass('min-size')
        $('th.buyPrice').removeClass('min-size')
    }))
    $('.container > div:nth-child(4) > div:nth-child(2)').append($('<a role="button" class="btn btn-outline-danger ms-lg-3 mt-2 mt-lg-0">Delete</a>').click(function() {
        console.log('delete prices')
        setCachedObject(keyPrice, {})
        // todo delete ui
    }))

    // STASH
    ;(async () => {
        try {
            const stash = await fetchStash()

            $('#WantsListTable table tbody tr').each(function() {
                const id = nameToId($(this).find('.name a').text())
                const languages = $(this).find('.languages .icon').map(function() {
                    return langToCode($(this).attr('aria-label'))
                }).get()

                let countStashString = ''
                let countStash = 0
                languages.forEach((lang) => countStashString += ' ' + (countStash += getSum(stash, id, lang)))

                const countStashAllLang = getSum(stash, id, undefined)
                if(countStashAllLang > countStash)
                    countStashString += ' (<abbr title="Same card in all languages">'+countStashAllLang+'</abbr>)'

                console.log(countStashString)

                if(countStash > 0 || countStashAllLang > 0)
                    $(this).find('td:nth-child(8)').append(`<span><span class="fonticon-offers icon is-16x16"></span>${countStashString}</span>`)
            })
        } catch (error) {
            console.error(error)
        }
    })()
}

/*** SHOPPING CART ***/
if(window.location.pathname.indexOf('/ShoppingCart')) {

    ;(async () => {
        try {
            const stash = await fetchStash()

            $('table[id^="ArticleTable"] tbody tr')
                    .each(function() {
                const id = nameToId($(this).attr('data-name'))
                const amount = parseInt($(this).find('.amount').attr('data-amount'))
                const lang = langToCode($(this).find('.icon>.icon').attr('aria-label'))
                const countStash = getSum(stash, id, lang)
                const countStashAllLang = getSum(stash, id, undefined)
                const countStashAllLangAbbr = countStashAllLang > countStash ? ' (<abbr title="Same card in all languages">'+countStashAllLang+'</abbr>)' : ''

                $(this).find('.extras').append(`<span><span class="fonticon-offers icon is-16x16"></span> Stash: ${countStash}${countStashAllLangAbbr}</span>`)
            })

        } catch (error) {
            console.error(error)
        }
    })()
}

/*** SINGLES ***/
if(window.location.pathname.indexOf('/Products/Singles/')) {
    const stash = await fetchStash()
    const name = $('.page-title-container h1').clone().children().remove().end().text()
    const id = nameToId(name)
    const countStashAllLang = getSum(stash, id, undefined)

    console.log(countStashAllLang )
    $('.info-list-container>dl').append(`<dt class="col-6 col-xl-5">Stash</dt>`)
    $('.info-list-container>dl').append(`<dd class="col-6 col-xl-7"><span class="fonticon-offers icon is-16x16"></span> <span>${countStashAllLang}</span></dd>`)
}

