document.addEventListener("DOMContentLoaded", function () {
    // DOM vars
    const list = document.getElementById('list');
    const showPanel = document.getElementById('show-panel');
    const userPanel = document.getElementById('user-panel');

    // stateful vars
    let books = [];
    let users = [];
    let selectedUser = { id: 1, username: "pouros" }; // Hardcoded user
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
        if (e.target && e.target.id) {
            selectedBook = books.find((book) => book.id === e.target.id);
            if (selectedBook) {
                renderShowPanel(selectedBook);
            } else {
                console.error("Selected book not found");
            }
        }
    });

    // Render book details
    function renderShowPanel(book) {
        const userList = book.users
            .map((user) => `<li id="${user.id}">${user.username}</li>`)
            .join("");

        let buttonText = "LIKE";
        for (let i = 0; i < book.users.length; i++) {
            if (book.users[i].username === "pouros") {
                buttonText = "UNLIKE";
                break;
            }
        }

        showPanel.innerHTML = `
            <img src="${book.img_url}" />
            <h4>${book.title}</h4>
            <p>${book.description}</p>
            <ul>${userList}</ul>
            <button id="likeButton">${buttonText}</button>
        `;

        document.getElementById("likeButton").addEventListener("click", toggleLike);
    }

    async function toggleLike() {
        let updatedUsers = [];
        let found = false;

        for (let i = 0; i < selectedBook.users.length; i++) {
            if (selectedBook.users[i].username === "pouros") {
                found = true;
            } else {
                updatedUsers.push(selectedBook.users[i]);
            }
        }

        if (!found) {
            updatedUsers.push(selectedUser);
        }

        try {
            const r = await fetch(`http://localhost:3000/books/${selectedBook.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ users: updatedUsers }),
            });

            if (!r.ok) {
                throw new Error("Failed to update book");
            }

            selectedBook.users = updatedUsers;
            renderShowPanel(selectedBook);
        } catch (error) {
            console.error("Error updating user: ", error);
        }
    }

    init();
});
