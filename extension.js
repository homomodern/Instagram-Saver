'use strict'

const iconDownload = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
</svg>`

const iconNewtab = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-zoom-in" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
  <path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/>
  <path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/>
</svg>`
//const quality = ['640w', '750w', '1080w']
let currentUrl = document.location.href
let updating = false

// const actionPanel = 'section.ltpMr.Slqrh'
// const actionPanelDiv = '.eo2As'

init(10)

locationChange()

window.addEventListener('scroll', update)

function init (times) {
  for (let i = 0; i < times; i++) {
    setTimeout(addButton, 500 * i)
    setTimeout(checkSort, 500 * i)
  }
}

function addButton () {
  // get action panel
  document.querySelectorAll('section.ltpMr.Slqrh:not(.section-set)').forEach(panel => {
    panel.classList.add('section-set')
    // button 1: download
    panel.lastElementChild.before(createButton('download-set', iconDownload))
    // button 2: new tab
    panel.lastElementChild.before(createButton('newtab-set', iconNewtab))
  })
}

function createButton (myClass, icon) {
  // create
  const button = document.createElement('button')
  button.innerHTML = icon
  // These gibberish classes below are needed for some IG CSS styles to be apllied to the buttons to fit the general style
  button.className = `dCJp8 afkep ${myClass}`

  switch (myClass) {
    case 'download-set':
      button.addEventListener('pointerdown', downloadImage)
      break
    case 'newtab-set':
      button.addEventListener('pointerdown', newTabImage)
      break
  }

  return button
}

function checkSort () {
  // sometimes, the "share" button is created slower than this userscript.
  // this function will sort the button to the original position.
  document.querySelectorAll('section.ltpMr.Slqrh.section-set')
    .forEach(panel => {
      const count = panel.childElementCount
      const penultimate = panel.children[count - 2]
      if (!penultimate.className.includes('wpO6b')) return
      const custom = panel.querySelector('.dCJp8')
      panel.insertBefore(penultimate, custom)
    })
}

function newTabImage () {
  const tab = window.open(getSourceLink.call(this), '_blank')
  tab.focus()
}

function getSourceLink () {
  const parent = this.closest('.eo2As').previousElementSibling
  // Check if it's a photo set
  const single = !parent.querySelectorAll('._3eoV-.IjCL9').length
  const file = single
    ? parent.querySelector('video') || parent.querySelector('img')
    : detectIndex(parent, parent.querySelectorAll('li.Ckrof'))
  const link = file.srcset ? findBestQuality(file.srcset) : file.src
  return link
}

function detectIndex (parent, files) {
  let file
  // detect position by 2 dynamic arrow buttons on the view panel.
  const prev = parent.querySelectorAll('.POSa_').length
  const next = parent.querySelectorAll('._6CZji').length
  // first
  if (!prev && !!next) file = files[0]
  // middle || last
  else file = files[1]
  return file.querySelector('video') || file.querySelector('img')
}

function findBestQuality (srcset) {
  const srcs = srcset.split(/\s|,\s?/).reverse()
  const srcsObj = {}
  while(srcs.length) {
    Object.assign(srcsObj, Object.fromEntries([srcs.splice(0,2)]))
  }
  return srcsObj[Math.max(...Object.keys(srcsObj)
    .map(key => Number.parseInt(key))) + 'w'] || alert('No data available')
}

function downloadImage () {
  const article = this.closest('article')
  const link = getSourceLink.call(this)
  fetch(link)
  .then(res => res.blob())
  .then(blob => {
    const a = document.createElement('a')
    const name = `${getUser(article)}_${getTime(article)}${getIndex(article)}`
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
  }).catch(err => console.log(err.message))
}

function getUser (article) {
  return article.querySelector('.e1e1d a').innerText.replace('.', '-')
}

function getTime (article) {
  const date = article.querySelector('time').dateTime.split(/[-,T]/)
  return `${date[0]}${date[1]}${date[2]}`
}

function getIndex (article) {
  const index = article.querySelectorAll('.Yi5aA')
  if (index.length > 1) {
    // photo set
    return `-${[...index].findIndex(index => index.classList.contains('XCodT')) + 1}`
  } else {
    // single photo
    return ''
  }
}

function update () {
  if (updating) return
  updating = true
  init(3)
  setTimeout(() => { updating = false }, 1000)
}

function locationChange () {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(() => {
      if (currentUrl !== document.location.href) {
        currentUrl = document.location.href
        init(10)
      }
    })
  })
  const target = document.querySelector('body')
  const config = { childList: true, subtree: true }
  observer.observe(target, config)
}
