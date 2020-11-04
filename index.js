// URL
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 資料
const movies = []
let filteredMovies = []
const MOVIES_PER_PAGE = 12
let changeSwitch = 'card'
let page = 1

// 要監聽的地方
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector('#change-mode')

// 程式集
// 修改電影主頁面的程式
function renderMovieCardMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

// 修改分頁器頁數的程式
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 修改點擊More之後顯示的內容
function showMovieModal(id) {
  const showData = movies.find((movie) => movie.id === id)
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  modalTitle.innerText = showData.title
  modalDate.innerText = 'Release date: ' + showData.release_date
  modalDescription.innerText = showData.description
  modalImage.innerHTML = `<img src="${POSTER_URL + showData.image}" alt="movie-poster" class="img-fluid">`
}

// 將點選到的電影增加至favorite的函式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 切換至List的函式
function renderMovieListMode(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
                <div class="col-sm-12">
                  <div class="d-flex flex-row justify-content-between border-top">
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item border-0">${item.title}</li>
                    </ul>
                    <div class="pt-3 pb-3 pl-1 pr-1">
                      <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
          data-id="${item.id}">
                      More
                      </button>
                      <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                    </div>
                  </div>
                </div>
               `
  })

  dataPanel.innerHTML = rawHTML
}

// 在不同模式下應該採取的行動
function chooseRenderMode(input, mode, page) {
  if (mode === 'list') {
    renderMovieListMode(getMoviesByPage(page))
  } else if (mode === 'card') {
    renderMovieCardMode(getMoviesByPage(page))
  }
}

// 監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 取消預設事件
  event.preventDefault()

  // 取得關鍵字，並儲存符合篩選的項目
  const keyword = searchInput.value.trim().toLowerCase()

  // 條件篩選
  // 作法一，用for...of
  // for (const movie of movies) {
  //  if (movie.title.toLowerCase().includes(keyword)) {
  //    filteredMovies.push(movie)
  //  }
  // }

  // 作法二，用條件來迭代：filter
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  // 錯誤處理
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合的電影`)
  }

  // 重新輸出至畫面
  page = 1
  chooseRenderMode(filteredMovies, changeSwitch, page)
  renderPaginator(filteredMovies.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  page = Number(event.target.dataset.page)
  chooseRenderMode(getMoviesByPage(page), changeSwitch, page)
})

changeMode.addEventListener('click', function onChangeModeClicked(event) {
  const data = filteredMovies.length ? filteredMovies : movies

  if (event.target.matches('.card-mode')) {
    changeSwitch = 'card'
    chooseRenderMode(data, changeSwitch, page)
  } else if (event.target.matches('.list-mode')) {
    changeSwitch = 'list'
    chooseRenderMode(data, changeSwitch, page)
  }
  renderPaginator(data.length)
})

// API & Ajax
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCardMode(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))