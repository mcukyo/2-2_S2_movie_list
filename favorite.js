const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
//修改 movies
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 宣告函式：印出所有電影清單 （傳入的參數movies是收藏清單裡的電影)
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
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

// 宣告函式：刪除收藏電影
function removeFavorite(id) {
  // 若movies陣列不存在or雖存在但為空陣列，則結束函式
  if (!movies || !movies.length) return
  //透過 id 找到要刪除電影的 index
  const MovieIndex = movies.findIndex(movie => movie.id === id)
  //若沒有符合id的電影(此時.findIndex會回傳-1)，則結束函式
  if (MovieIndex === -1) return
  //刪除該筆電影
  movies.splice(MovieIndex, 1)
  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  //更新頁面
  renderMovieList(movies)
}


// 在dataPanel設置監聽器：
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 點擊more按鈕時呼叫 showMovieModal 函式，並傳送 id 參數
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal((event.target.dataset.id))
  }
  // 點擊 + 按鈕則呼叫 removeFavorite 函式，並傳送 id 參數
  if (event.target.matches('.btn-remove-favorite')) { //檢查對象改為 .btn-remove-favorite
    removeFavorite(Number(event.target.dataset.id)) //呼叫的函式改為 removeFavorite
  }
})




// 呼叫 renderMovieList 函式，傳入movies參數
renderMovieList(movies)




