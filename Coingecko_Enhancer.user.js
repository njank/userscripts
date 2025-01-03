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
    console.log(data)

    // fast currency switcher
    let currencies = [ "USD", "EUR" ]
    currencies.forEach(function(c) {
        $('body > div.header.dashboard > div.d-none.d-lg-block.middle-header.text-black.text-2xs > div > div').prepend(
            $(`<div class="mr-3"><span><a href="#" class="text-black">${c}</a></span></div>`).click(function() { $(`#currency-selector span.text-muted:contains("${c}")`).click() } )
        )
    });

    // title
    document.title = parseInt(data.usd);

    setInterval(function() {
        $.getJSON("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", function(data) {
            document.title = data.bitcoin.usd
        })
    }, 1000 * 60)
    /*
    (function refreshTitle() {
        let portfolioChangePerc = $('div.portfolio-overview > span:nth-child(3) > div.text-normal.overview-label > span.text-green').html()
        if(portfolioChangePerc === undefined) {
            setTimeout(refreshTitle, 100);
        }else{
            document.title = 'Portfolio '+portfolioChangePerc
        }
    })();*/

    // claim candies
    $.getJSON( "/accounts/csrf_meta.json", function( data ) {
        let token = data.token

        /*$.ajax({
        url: 'https://www.coingecko.com/account/candy?locale=en',
        success: function(data){
            console.log(data)
            let collectCandiesForm = $(data).find('form.button_to').serialize()
            if(collectCandiesForm)
                $.post(
                    'https://www.coingecko.com/account/candy/daily_check_in?locale=en',
                    collectCandiesForm,
                    function(data) { console.log('posted') },
                    'json'
                );
        }
    });*/

        //$.ajax({
        //    url: '/en/candy/daily_check_in',
        //    beforeSend: function(xhr) {
        //         xhr.setRequestHeader("referrer", "https://www.coingecko.com/en/candy");
        //         xhr.setRequestHeader("referrerPolicy", "strict-origin-when-cross-origin");
        //         xhr.setRequestHeader("body", null);
        //         xhr.setRequestHeader("method", "POST");
        //         xhr.setRequestHeader("mode", "cors");
        //         xhr.setRequestHeader("credentials", "include");
        //    },
        //    headers: {
        //        "accept": "*/*",
        //        "accept-language": "en-US,en;q=0.9,de;q=0.8,de-AT;q=0.7",
        //        "priority": "u=1, i",
        //        "sec-ch-ua": "\"Microsoft Edge\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        //        "sec-ch-ua-arch": "\"x86\"",
        //        "sec-ch-ua-bitness": "\"64\"",
        //        "sec-ch-ua-full-version": "\"129.0.2792.52\"",
        //        "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"129.0.2792.52\", \"Not=A?Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"129.0.6668.59\"",
        //        "sec-ch-ua-mobile": "?0",
        //        "sec-ch-ua-model": "\"\"",
        //        "sec-ch-ua-platform": "\"Windows\"",
        //        "sec-ch-ua-platform-version": "\"15.0.0\"",
        //        "sec-fetch-dest": "empty",
        //        "sec-fetch-mode": "cors",
        //        "sec-fetch-site": "same-origin",
        //        'x-csrf-token': token,
        //    }, success: function(data){
        //        console.log("success")
        //    }, error: function(data){
        //        console.log(data)
        //    }
        //});
    });

    if(document.getElementById('collectButton')) {
        //document.getElementById('collectButton').click()
    } else {
        $.ajax({
            url: 'https://www.coingecko.com/account/candy?locale=en',
            success: function(data){
                console.log($(data).find('#collectButton'))
                $(data).find('#collectButton').click()
            }
        });
    }

});
