// ==UserScript==
// @name         Coingecko_Enhancer
// @description  Coingecko Enhancer
// @namespace    coingecko
// @version      0.1
// @author       njank
// @match        https://www.coingecko.com/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/njank/userscripts/main/Coingecko_Enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/njank/userscripts/main/Coingecko_Enhancer.user.js
// @run-at       document-end
// ==/UserScript==


$(window).on('load', function() {
    // data
    let data = JSON.parse($('body').attr('data-exchange-rate-json'))

    // fast currency switcher
    let currencies = [ "USD", "EUR" ]
    currencies.forEach(function(c) {
        $('body > div.header.dashboard > div.d-none.d-lg-block.middle-header.text-black.text-2xs > div > div').prepend(
            $(`<div class="mr-3"><span><a href="#" class="text-black">${c}</a></span></div>`).click(function() { $(`#currency-selector span.text-muted:contains("${c}")`).click() } )
        )
    });

    // title
    (function refreshTitle() {
        let portfolioChangePerc = $('div.portfolio-overview > span:nth-child(3) > div.text-normal.overview-label > span.text-green').html()
        if(portfolioChangePerc === undefined) {
            setTimeout(refreshTitle, 100);
        }else{
            document.title = 'Portfolio '+portfolioChangePerc
        }
    })();

    // claim candies
    $.ajax({
        url: 'https://www.coingecko.com/account/candy?locale=en',
        success: function(data){
            let collectCandiesForm = $(data).find('form.button_to').serialize()
            if(collectCandiesForm)
                $.post(
                    'https://www.coingecko.com/account/candy/daily_check_in?locale=en',
                    collectCandiesForm,
                    function(data) { console.log('posted') },
                    'json'
                );
        }
    });

    // censor
    $('body > div.container > div:nth-child(2) > div.container.px-0 > div.row.no-gutters.tw-flex-auto.tw-justify-between > div.tw-flex.mt-5.mt-md-0').prepend(
        $(`<a href="#" class="far fa-eye-slash text-2xl text-black pr-3 tw-self-center"></a>`).click(function(){
            [
                $('body > div.container > div:nth-child(2) > div.container.px-0 > div.portfolio-overview > span > span'),
                $('body > div.container > div:nth-child(2) > div.gecko-table-container > div.coingecko-table > div.position-relative > div > div > table > tbody > tr > td.text-right.col-gecko div')
            ].forEach(function(o) {
                o.each(function( index ) {
                    let c = $(this).children().clone()
                    $(this).text('$***').append(c)
                });
            });
        })
    )
});
