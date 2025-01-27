document.addEventListener("DOMContentLoaded", function () {
   // DOM vars
   const list = document.getElementById('list');
   const showPanel = document.getElementById('show-panel');
   const userPanel = document.getElementById('user-panel');
   // stateful vars
   let books = [];
   let users = [];
   let selectedUser;
   let selectedBook;


   async function fetchBooks() {
      const response = await fetch("http://localhost:3000/books");
      if (!response.ok) throw new Error("Failed to fetch books");
      return response.json();
   }


   async function fetchUsers() {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
   }


   async function init() {
      try {
         books = await fetchBooks();
         users = await fetchUsers();
         renderBookList(books);
      } catch (error) {
         console.error("init: ", error);
      }
   }


   function renderBookList(data) {
      list.innerHTML = data.map((book) => `<li id="${book.id}">${book.title}</li>`).join("");
   }

   list.addEventListener("click", (e) => {
      selectedBook = books.find((book) => book.id === parseInt(e.target.id));
      if (selectedBook) {
         renderShowPanel(selectedBook);
      } else {
         console.error("Selected book not found");
      }
   });

   // Render book details
   function renderShowPanel(book) {
      const userList = book.users
         .map((user) => `<li id="${user.id}">${user.username} <button id='${user.id}'>LIKE</button></li>`)
         .join("");
      showPanel.innerHTML = `
         <img src="${book.img_url}" />
         <h4>${book.title}</h4>
         <p>${book.description}</p>
         <ul>${userList}</ul>
      `;
   }

   showPanel.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'BUTTON') {
         const userId = parseInt(e.target.parentElement.id);
         const selUser = users.find((user) => user.id === userId);
         if (selUser) {
            removeUser(selUser);
         } else {
            console.error('User not found');
         }
      }
   });


   async function removeUser(selUser) {
      const bookId = selectedBook.id;
      const updatedUsers = selectedBook.users.filter((user) => user.id !== selUser.id);

      try {
         const r = await fetch(`http://localhost:3000/books/${bookId}`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users: updatedUsers }),
         });
         if (!r.ok) {
            throw new Error('Failed to update book');
         }
         selectedBook.users = updatedUsers;
         renderShowPanel(selectedBook);
      } catch (error) {
         console.error('Error removing user: ', error);
      }
   }

   init();
});
