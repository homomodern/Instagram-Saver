'use strict'

// iconDownload made by https://www.flaticon.com/authors/freepik
const iconDownload = `<svg width="24" height="24" viewBox="0 0 512 512" fill="#262626"><g><g><path d="M472,313v139c0,11.028-8.972,20-20,20H60c-11.028,0-20-8.972-20-20V313H0v139c0,33.084,26.916,60,60,60h392 c33.084,0,60-26.916,60-60V313H472z"></path></g></g><g><g><polygon points="352,235.716 276,311.716 276,0 236,0 236,311.716 160,235.716 131.716,264 256,388.284 380.284,264"></polygon></g></g></svg>`
// iconNewtab made by https://www.flaticon.com/authors/those-icons
const iconNewtab = `<svg width="24" height="24" viewBox="0 0 482.239 482.239" fill="#262626"><path d="m465.016 0h-344.456c-9.52 0-17.223 7.703-17.223 17.223v86.114h-86.114c-9.52 0-17.223 7.703-17.223 17.223v344.456c0 9.52 7.703 17.223 17.223 17.223h344.456c9.52 0 17.223-7.703 17.223-17.223v-86.114h86.114c9.52 0 17.223-7.703 17.223-17.223v-344.456c0-9.52-7.703-17.223-17.223-17.223zm-120.56 447.793h-310.01v-310.01h310.011v310.01zm103.337-103.337h-68.891v-223.896c0-9.52-7.703-17.223-17.223-17.223h-223.896v-68.891h310.011v310.01z"></path></svg>`
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