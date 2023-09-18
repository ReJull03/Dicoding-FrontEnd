const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted = false) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, inputBookIsComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

const inputBookIsComplete = document.getElementById("inputBookIsComplete");
inputBookIsComplete.addEventListener("change", function () {
  renderBooks();
});

function renderBooks() {
  const completeBookshelfList = document.getElementById("completeBookshelfList");
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");

  for (const bookItem of books) {
    if (inputBookIsComplete.checked && bookItem.isCompleted) {
      const bookElement = makeBook(bookItem);
      completeBookshelfList.appendChild(bookElement);
    } else if (!inputBookIsComplete.checked && !bookItem.isCompleted) {
      const bookElement = makeBook(bookItem);
      incompleteBookshelfList.appendChild(bookElement);
    }
  }
}

document.addEventListener("DOMContentLoaded", renderBooks);

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookshelfList = document.getElementById("incompleteBookshelfList");
  incompletedBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById("completeBookshelfList");
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      incompletedBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `${"Penulis: "} ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `${"Tahun: "} ${bookObject.year}`;

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("action");

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(textTitle, textAuthor, textYear, actionDiv);
  article.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus buku";

    deleteButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    actionDiv.append(deleteButton);
  } else {
    const doneButton = document.createElement("button");
    doneButton.classList.add("green");
    doneButton.innerText = "Selesai dibaca";

    doneButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("yellow");
    editButton.innerText = "Edit buku";

    editButton.addEventListener("click", function () {
      editBookFromCompleted(bookObject.id);
    });

    actionDiv.append(doneButton, editButton);
  }

  return article;
}

const searchButton = document.getElementById("searchSubmit");

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    renderBooks();
    console.log(books);
  });
});

searchButton.addEventListener("click", (event) => {
  const titleKeyword = document.getElementById("searchBookTitle").value;
  const bookItems = document.querySelectorAll(".book_title");
  for (const bookItem of bookItems) {
    const bookTitle = bookItem.innerText;
    if (titleKeyword[0].toLowerCase().includes(bookTitle.toLowerCase())) {
      bookItem.removeAttribute("hidden");
    } else {
      bookItem.setAttribute("hidden");
    }
  }

  event.preventDefault();
});

if (isStorageExist()) {
  loadDataFromStorage();
}

const searchSubmitButton = document.getElementById("searchSubmit");
const searchBookTitleInput = document.getElementById("searchBookTitle");
const searchResultsContainer = document.getElementById("searchResults");

searchSubmitButton.addEventListener("DOMContentLoaded", () => {
  const searchTerm = searchBookTitleInput.value.toLowerCase();
  const searchResults = books.filter((book) => book.title.toLowerCase().includes(searchTerm));

  displaySearchResults(searchResults);
});

function displaySearchResults(results) {
  searchResultsContainer.innerHTML = "";

  if (results.length === 0) {
    searchResultsContainer.innerHTML = "<p>Tidak ada hasil yang ditemukan.</p>";
    return;
  }

  results.forEach((book) => {
    const bookElement = makeBook(book);
    searchResultsContainer.appendChild(bookElement);
  });
}
