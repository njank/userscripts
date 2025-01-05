// ==UserScript==
// @name         OP Top Decks
// @description  OP Top Decks
// @namespace    njank
// @version      0.0.1
// @author       njank
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @match        onepiecetopdecks.com/deck-list/*/
// @require      http://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

/* parsed from https://onepiececardgame.altervista.org/st20-eng/
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);
let x = jQuery('.wave>div').text()
let y = [...x.matchAll(/ (\w+\d*-\d+).*?\((L|SR|C|R|UC|P)\).*?\(x(\d)\)/g)]
y.reduce((r, a) => {
     r += "a" + a[3] + "n" + a[1]
      return r;
    }, '').substring(1);
*/
const starterDecks = {
    'ST-01': '1nST01-001a4nST01-002a4nST01-003a4nST01-004a4nST01-005a4nST01-006a4nST01-007a4nST01-008a4nST01-009a4nST01-010a2nST01-011a2nST01-012a2nST01-013a2nST01-014a2nST01-015a2nST01-016a2nST01-017a1nST01-001a4nST01-002a4nST01-003a4nST01-004a4nST01-005a4nST01-006a4nST01-007a4nST01-008a4nST01-009a4nST01-010a2nST01-011a2nST01-012a2nST01-013a2nST01-014a2nST01-015a2nST01-016a2nST01-017', // red luffy
    'ST-02': '1nST02-001a4nST02-002a2nST02-003a4nST02-004a2nST02-005a4nST02-006a4nST02-007a4nST02-008a2nST02-009a2nST02-010a4nST02-011a4nST02-012a2nST02-013a4nST02-014a2nST02-015a4nST02-016a2nST02-017a1nST02-001a4nST02-002a2nST02-003a4nST02-004a2nST02-005a4nST02-006a4nST02-007a4nST02-008a2nST02-009a2nST02-010a4nST02-011a4nST02-012a2nST02-013a4nST02-014a2nST02-015a4nST02-016a2nST02-017', // green eustass captain kid
    'ST-03': '1nST03-001a4nST03-002a2nST03-003a2nST03-004a2nST03-005a4nST03-006a2nST03-007a4nST03-008a2nST03-009a4nST03-010a4nST03-011a4nST03-012a4nST03-013a2nST03-014a4nST03-015a4nST03-016a2nST03-017a1nST03-001a4nST03-002a2nST03-003a2nST03-004a2nST03-005a4nST03-006a2nST03-007a4nST03-008a2nST03-009a4nST03-010a4nST03-011a4nST03-012a4nST03-013a2nST03-014a4nST03-015a4nST03-016a2nST03-017', // blue crocodile
    'ST-04': '1nST04-001a4nST04-002a2nST04-003a2nST04-004a2nST04-005a4nST04-006a4nST04-007a2nST04-008a4nST04-009a2nST04-010a4nST04-011a4nST04-012a4nST04-013a2nST04-014a2nST04-015a4nST04-016a4nST04-017a1nST04-001a4nST04-002a2nST04-003a2nST04-004a2nST04-005a4nST04-006a4nST04-007a2nST04-008a4nST04-009a2nST04-010a4nST04-011a4nST04-012a4nST04-013a2nST04-014a2nST04-015a4nST04-016a4nST04-017', // purple kaido
    'ST-05': '1nST05-001a4nST05-002a4nST05-003a2nST05-004a2nST05-005a2nST05-006a4nST05-007a2nST05-008a4nST05-009a2nST05-010a2nST05-011a4nST05-012a4nST05-013a4nST05-014a4nST05-015a2nST05-016a4nST05-017', // purple shanks
    'ST-06': '1nST06-001a2nST06-002a4nST06-003a2nST06-004a4nST06-005a4nST06-006a4nST06-007a2nST06-008a4nST06-009a4nST06-010a4nST06-011a2nST06-012a4nST06-013a2nST06-014a2nST06-015a4nST06-016a2nST06-017', // black sakazuki
    'ST-07': '1nST07-001a4nST07-002a2nST07-003a4nST07-004a2nST07-005a4nST07-006a2nST07-007a4nST07-008a2nST07-009a2nST07-010a4nST07-011a4nST07-012a4nST07-013a4nST07-014a4nST07-015a2nST07-016a2nST07-017', // yellow charlotte linlin
    'ST-08': '1nST08-001a2nST08-002a4nST08-003a4nST08-004a2nST08-005a4nST08-006a4nST08-007a4nST08-008a4nST08-009a4nST08-010a4nST08-011a4nST08-012a4nST08-013a4nST08-014a2nST08-015', // black luffy
    'ST-09': '1nST09-001a4nST09-002a4nST09-003a4nST09-004a2nST09-005a4nST09-006a4nST09-007a4nST09-008a4nST09-009a2nST09-010a4nST09-011a4nST09-012a4nST09-013a2nST09-014a4nST09-015', // yellow yamato
    'ST-10': '1nST10-001a1nST10-002a1nST10-003a4nST10-004a2nST10-005a2nST10-006a4nST10-007a4nST10-008a4nST10-009a2nST10-010a4nST10-011a4nST10-012a2nST10-013a4nST10-014a2nST10-015a2nST10-016a2nST10-017a4nOP01-016a4nOP01-025', // red/purple trafalgar law
    'ST-11': '1nST11-001a2nST11-002a2nST11-003a2nST11-004a4nST11-005a4nOP02-028a4nOP02-033a4nOP02-034a4nOP02-035a4nOP02-037a4nOP02-039a4nOP02-040a4nOP02-041a4nOP02-043a4nOP02-045', // green uta
    'ST-12': '1nST12-001a4nST12-002a2nST12-003a4nST12-004a4nST12-005a4nST12-006a4nST12-007a2nST12-008a4nST12-009a2nST12-010a2nST12-011a4nST12-012a4nST12-013a2nST12-014a4nST12-015a2nST12-016a2nST12-017', // green/blue roronoa zoro
    'ST-13': '1nST13-001a1nST13-002a1nST13-003a4nST13-004a2nST13-005a4nST13-006a4nST13-007a2nST13-008a4nST13-009a4nST13-010a2nST13-011a4nST13-012a2nST13-013a4nST13-014a2nST13-015a4nST13-016a2nST13-017a2nST13-018a4nST13-019a1nST13-001a1nST13-002a1nST13-003a1nST13-004a1nST13-005a1nST13-006a1nST13-007a1nST13-008a1nST13-009a1nST13-010a1nST13-011a1nST13-012a1nST13-013a1nST13-014a1nST13-015a1nST13-016', // yellow/red sabo
    'ST-14': '1nST14-001a4nST14-002a2nST14-003a4nST14-004a4nST14-005a2nST14-006a4nST14-007a4nST14-008a4nST14-009a4nST14-010a4nST14-011a2nST14-012a4nST14-013a2nST14-014a2nST14-015a2nST14-016a2nST14-017', // black luffy
    'ST-15': '1nOP02-001a4nST15-001a2nST15-002a4nST15-003a2nST15-004a2nST15-005a4nOP02-008a4nOP02-018a4nOP02-019a4nOP02-023a4nOP03-003a4nOP03-006a4nOP03-007a4nOP03-009a4nOP03-010', // red edward newgate
    'ST-16': '1nST11-001a2nST16-001a4nST16-002a4nST16-003a2nST16-004a2nST16-005a4nP-029a4nP-057a4nP-058a4nP-059a4nP-060a4nP-061a4nST11-003a4nST11-004a4nST11-005', // green uta
    'ST-17': '1nOP01-060a4nST17-001a2nST17-002a2nST17-003a2nST17-004a4nST17-005a4nOP01-073a4nOP01-086a4nOP02-054a4nOP02-057a4nP-030a4nST03-002a4nST03-004a4nST03-005a4nST03-008', // blue op1doffy
    'ST-18': '1nOP05-060a2nST18-001a4nST18-002a4nST18-003a2nST18-004a2nST18-005a4nOP05-061a4nOP05-063a4nOP05-066a4nOP05-067a4nOP05-068a4nOP05-070a4nOP05-072a4nOP05-076a4nP-041', // purple op5luffy
    'ST-19': '1nOP02-093a4nST19-001a2nST19-002a2nST19-003a2nST19-004a4nST19-005a4nOP02-098a4nOP02-106a4nOP02-108a4nOP02-109a4nOP02-113a4nOP02-116a4nOP02-117a4nOP03-079a4nOP03-089', // black op2smoker
    'ST-20': '1nOP03-099a2nST20-001a4nST20-002a4nST20-003a2nST20-004a2nST20-005a4nOP03-106a4nOP03-107a4nOP03-110a4nOP03-112a4nOP03-115a4nOP03-118a4nOP03-121a4nST07-005a4nST07-014', // yellow op3katakuri
    'ST-21': '1nST21-001a1nST21-002a1nST21-003a1nST21-004a1nST21-005a1nST21-006a1nST21-007a1nST21-008a1nST21-009a1nST21-010a1nST21-011a1nST21-012a1nST21-013a1nST21-014a1nST21-015a1nST21-016a1nST21-017a1nST21-001a1nST21-002a1nST21-003a1nST21-004a1nST21-005a1nST21-006a1nST21-007a1nST21-008a1nST21-009a1nST21-010a1nST21-011a1nST21-012a1nST21-013a1nST21-014a1nST21-015', // red ex gear 5
}
const round = d => Math.round(d*100)/100

let optionsStarterDecks = ''
Object.keys(starterDecks).forEach(function(key) {
    optionsStarterDecks += `<option value="${starterDecks[key]}">${key}</option>`
})

const uiDropdownBase = $(`
  <div class="column-filter-widget">
    <select id="dropDownBase">
      <option>none</option>
      ${optionsStarterDecks}
    </select>
  </div>
`)

/* deck give as a string e.g. "1nOP01-060a4nST17-001" with a .. card separator, n .. count/name separator */
function splitDeckString(s) {
    let cards = s.split('a')
    let count = []
    cards.forEach((c,index) => {
        count[index] = parseInt(c.split('n')[0])
        cards[index] = c.split('n')[1]
    })
    return { cards:cards, count:count }
}

const uiButtonAnalyse = $('<button>analyse</button>').on('click', function() {

    // get source deck(s)
    let decks = []
    const input = $('#dt-search-0').val()
    if(input.match(/^(\d+n[^-]+-\d+(a|$))+/)) {
        // source deck as input
        decks.push(splitDeckString(input))
        // black purple luffy (https://www.youtube.com/watch?v=Xc2DnQ5tCRM)
        //   1nOP05-098a2nEB01-056a3nEB01-057a2nOP03-116a4nOP03-123a4nOP04-100a4nOP04-112a4nOP05-102a3nOP07-107a2nOP07-112a4nOP07-119a3nOP08-106a3nOP09-101a4nEB01-059a1nOP05-115a4nOP06-115a3nOP09-117
        // smoker st-19 (https://www.youtube.com/watch?v=ajlcAU0WDnA)
        //   1nOP02-093a4nEB01-046a2nEB01-049a2nOP02-096a4nOP02-106a3nOP02-114a4nOP03-089a2nOP04-083a4nOP05-091a4nOP06-086a3nOP08-084a3nST06-006a3nST06-008a1nST06-010a4nST19-002a4nST19-003a3nOP02-117
        // purple luffy st-18 (https://www.youtube.com/watch?v=1IIG4Xk0MqY)
        //   1nOP05-060a3nEB01-061a3nOP04-064a2nOP05-070a2nOP05-074a1nOP05-119a2nOP06-076a4nOP07-064a4nOP08-069a1nST04-003a2nST04-005a2nST10-010a4nST18-001a4nST18-002a4nST18-003a4nST18-004a4nST18-005a2nOP03-072a2nOP05-076
        // blue doffy st-17 (https://www.youtube.com/watch?v=G60p8dPGH8A)
        //   1nOP01-060a4nOP01-077a4nOP07-046a2nST17-003a2nST17-005a3nOP06-047a2nOP07-047a4nOP07-040a4nOP07-045a2nST03-004a4nST03-005a4nST17-002a4nEB01-023a4nST17-004a4nOP08-047a1nST03-009a1nOP05-118a1nOP07-057
        // blue doffy st-17 (https://www.youtube.com/watch?v=sDkSO8L-lWc)
        //   1nOP01-60a4nEB01-023a4nOP01-077a2nOP05-118a4nST17-001a4nOP07-045a4nOP07-046a4nST03-004a4nST03-005a4nOP07-040a4nST17-002a4nST17-003a4nST17-004a2nOP04-056a2nOP06-058
        // blue doffy st-17 (https://gumgum.gg/decklists/deck/east/op10/304be6e7-fbfb-4920-baad-b7845cbb83c7)
        //   1nOP01-060a4nOP01-077a4nOP07-046a3nST17-003a3nST17-005a2nOP06-047a4nOP07-040a4nOP07-045a2nST03-004a4nST03-005a4nST17-002a4nEB01-023a4nST17-004a3nOP08-047a2nST03-009a1nOP07-057a2nOP04-056
    } else {
        // source decks found by filter
        $("[id^=tablepress-] tr:not(.row-1)").each(function( index ) {
            const row = $(this)
            decks[index] = splitDeckString(row.find('.column-1').text())
            decks[index] = { // todo { ...obj1, ...obj2 }
                cards: decks[index].cards,
                count: decks[index].count,
                //url: row.find('.column-2 a').attr('href'),
                //color: row.find('.column-3').text(),
                //color: row.find('.column-2 img').attr('src').replace(/^.*?(\w+)\.png/, '$1'),
                profile: row.find('.column-4').text(),
                //profileTitle: row.find('.column-5').text(),
                date: row.find('.column-6').text(),
                country: row.find('.column-7').text(),
                author: row.find('.column-8').text(),
                placement: row.find('.column-9').text(),
                tournament: row.find('.column-10').text(),
                host: row.find('.column-11').text(),
                note(i) { return `${this.placement} @ ${this.tournament} by ${this.host}` },
            }
        })
    }
    console.log(decks)

    // base
    const base = $('#dropDownBase').val() === 'none' ? { cards:[], count:[] } : splitDeckString($('#dropDownBase').val())

    // merge
    let merged = {
        cards: base.cards,
        countStart: base.count,
        countTotal: Array.from({length: base.count.length}, (_, i) => 0),
        unique: Array.from({length: base.count.length}, (_, i) => 0),
        countAverageWhenUsed(i) { return this.unique[i] === 0 ? 0 : round(this.countTotal[i]/this.unique[i]) },
        notes: Array.from({length: base.count.length}, (_, i) => "base"),
    }

    function valueExistsInArray(array1, value) {
        for(let i=0; i<array1.length; i++)
            if(array1[i] === value)
                return i
        return -1
    }

    for(let i=0; i<decks.length; i++) {
        for(let j=0; j<decks[i].cards.length; j++) {
            let mI = valueExistsInArray(merged.cards, decks[i].cards[j])
            if(mI >= 0) {
                merged.countTotal[mI] += decks[i].count[j]
                merged.unique[mI] ++
                merged.notes[mI] += ', ' + decks[i].note
            } else {
                merged.cards.push(decks[i].cards[j])
                merged.countTotal.push(decks[i].count[j])
                merged.unique.push(1)
                merged.notes.push(decks[i].note)
            }
        }
    }
    console.log(merged)

    // format to object
    let formatted = []
    for(let i=0; i<merged.cards.length; i++)
        formatted[i] = {
            card:merged.cards[i],
            countStart:merged.countStart[i] ? merged.countStart[i] : 0,
            countAverageWhenUsed:merged.countAverageWhenUsed(i),
            countTotal:merged.countTotal[i],
            unique:merged.unique[i],
            notes:merged.notes[i],
        }
    console.log(formatted)

    // format to text
    let out = ''
    const sorted = formatted.sort((a,b)=>{
        return b.card < a.card ? -1 : 1
    })
    for(let i=0; i<sorted.length; i++) {
        const needCount = Math.round(sorted[i].countTotal/decks.length)
        if(needCount > sorted[i].countStart && needCount - sorted[i].countStart > 0)
            out += (needCount - sorted[i].countStart) + 'x ' + sorted[i].card + '\n'
    }
    console.log(out)

    // difference
    let cardsAdded=0, cardsRemoved=0, cardsAddedSameSourceDecks=0
    for(let i=0; i<formatted.length; i++)
        if(formatted[i].countStart > formatted[i].countTotal/decks.length)
            cardsRemoved += formatted[i].countStart - formatted[i].countTotal/decks.length
        else
            if(formatted[i].countStart > 0)
                cardsAddedSameSourceDecks += formatted[i].countTotal/decks.length - formatted[i].countStart
            else
                cardsAdded += formatted[i].countTotal/decks.length - formatted[i].countStart
    console.log(`cards added: ${round(cardsAdded)} (increased count for ${round(cardsAddedSameSourceDecks)} from the same source decks), cards removed: ${round(cardsRemoved)}`)

    /*var promises = [];
    decks.forEach(async (d,index) => {
        promises.push(
            $.get( d.url, function( data ) {
                let deck = JSON.parse($(data).find('#media-gallery textarea').text())
                deck.shift()
                decks[index] = deck
                //console.log("load " + index + "/" + decks.length)
            })
        )
    })
    Promise.all(promises).then(() =>
                               console.log(decks)
                              );*/
})

$('[id^=tablepress-] .dt-search').append(uiDropdownBase).append(uiButtonAnalyse)


let cards = []
$.get( "https://asia-en.onepiece-cardgame.com/cardlist/", function( data ) {
    $(data).find( ".modalCol" ).each(function( index ) {
        cards[$(this).attr('id')].push({
            name: $(this).find('.cardName').text()
        })
    })
    console.log(cards)
})
