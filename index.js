const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
//儲存符合篩選條件的項目
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 宣告函式：印出所有電影清單
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id} ">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//宣告函式：依總頁數顯示分頁器
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template (包含data-page屬性)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

//宣告函式：依照被點擊的頁碼，取對應的12部電影資料
function getMoviesByPage(page) {
  //三元運算子：若filteredMovies.length為true則回傳filteredMovies，否則回傳movies
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) //slice提取start到end前一個，不包含end
}

// 宣告函式：顯示單一電影詳細資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  // 向 Show API 請求資料，再將取得之資料置入Modal元素
  axios.get(INDEX_URL + id)
    .then((res) => {
      const data = res.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch((err) => console.log(err))
}

// 宣告函式：加入收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favoriteMovie = movies.find(movie => movie.id === id)
  //若點擊的電影已在收藏清單裡，則結束函式並顯示alert訊息
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已在收藏清單中！')
  }

  list.push(favoriteMovie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// 在dataPanel設置監聽器：
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 點擊more按鈕時呼叫 showMovieModal 函式，並傳送 id 參數
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal((event.target.dataset.id))
  }
  // 點擊 + 按鈕則呼叫 addToFavorite 函式，並傳送 id 參數
  if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//在分頁器上設置監聽器：
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面(傳頁碼給getMoviesByPage取得slice過後的電影資訊，再傳給renderMovieList顯示畫面)
  renderMovieList(getMoviesByPage(page))
})


// 設置監聽器：提交 search bar 表單(即點擊submit按鈕)
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  //錯誤處理：輸入無效字串
  // if (!keyword.length) {
  //   alert('請輸入有效字串')
  // }

  //開始篩選(有for...of、forEach、filter 三種寫法)
  // for...of寫法（將符合條件者一一push到 filteredMovies 陣列裡）
  // for (let movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //     renderMovieList(filteredMovies)
  //   }
  // }

  // forEach寫法（將符合條件者一一push到 filteredMovies 陣列裡）
  // movies.forEach((movie) => {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //     renderMovieList(filteredMovies)
  //   }
  // })

  // filter寫法（符合條件者將被保留在filter回傳的陣列裡，再將此陣列賦值給 filteredMovies）（若沒有輸入任何關鍵字時，即keyword會是空陣列，則所有項目都會通過篩選，全部電影都會被印出）
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //將篩選過後的電影清單、分頁器重新印出
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


// 串接 Index API請求資料 & 呼叫 renderMovieList 函式，傳入movies參數
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))



