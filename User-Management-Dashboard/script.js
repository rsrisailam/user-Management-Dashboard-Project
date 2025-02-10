document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://jsonplaceholder.typicode.com/users";
    const userTableBody = document.getElementById("userTableBody");
    const modal = document.getElementById("userModal");
    const closeModal = document.querySelector(".close");
    const addUserBtn = document.getElementById("addUserBtn");
    const userForm = document.getElementById("userForm");

    let editMode = false;
    let editUserId = null;

    // Fetch and display users
    async function fetchUsers() {
        try {
            const response = await fetch(API_URL);
            const users = await response.json();
            userTableBody.innerHTML = "";

            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name.split(" ")[0]}</td>
                    <td>${user.name.split(" ")[1] || ""}</td>
                    <td>${user.email}</td>
                    <td>${user.company?.name || "N/A"}</td>
                    <td class="action-buttons">
                        <button class="edit" data-id="${user.id}">✏️ Edit</button>
                        <button class="delete" data-id="${user.id}">🗑️ Delete</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        } catch (error) {
            alert("Error fetching users!");
        }
    }

    // Show modal
    function showModal() {
        modal.style.display = "block";
    }

    // Hide modal
    function hideModal() {
        modal.style.display = "none";
        userForm.reset();
        editMode = false;
        editUserId = null;
    }

    // Add/Edit user
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const department = document.getElementById("department").value;

        const userData = {
            name: `${firstName} ${lastName}`,
            email,
            company: { name: department }
        };

        try {
            if (editMode) {
                await fetch(`${API_URL}/${editUserId}`, {
                    method: "PUT",
                    body: JSON.stringify(userData),
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                const response = await fetch(API_URL, {
                    method: "POST",
                    body: JSON.stringify(userData),
                    headers: { "Content-Type": "application/json" }
                });
                const newUser = await response.json();  // The new user that was added

                // Add the new user to the table dynamically
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${newUser.id}</td>
                    <td>${newUser.name.split(" ")[0]}</td>
                    <td>${newUser.name.split(" ")[1] || ""}</td>
                    <td>${newUser.email}</td>
                    <td>${newUser.company?.name || "N/A"}</td>
                    <td class="action-buttons">
                        <button class="edit" data-id="${newUser.id}">✏️ Edit</button>
                        <button class="delete" data-id="${newUser.id}">🗑️ Delete</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            }
            hideModal();
        } catch (error) {
            alert("Error saving user data!");
        }
    });

    // Handle click events for edit & delete buttons (event delegation)
    userTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("edit")) {
            const userId = e.target.getAttribute("data-id");
            editUser(userId);
        }

        if (e.target.classList.contains("delete")) {
            const userId = e.target.getAttribute("data-id");
            deleteUser(userId);
        }
    });

    // Edit user
    async function editUser(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const user = await response.json();

            document.getElementById("firstName").value = user.name.split(" ")[0];
            document.getElementById("lastName").value = user.name.split(" ")[1] || "";
            document.getElementById("email").value = user.email;
            document.getElementById("department").value = user.company?.name || "";

            editMode = true;
            editUserId = id;
            showModal();
        } catch (error) {
            alert("Error fetching user details!");
        }
    }

    // Delete user
    async function deleteUser(id) {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

                if (response.ok) {
                    // Remove the row manually from the table
                    document.querySelector(`button[data-id='${id}']`).closest("tr").remove();
                    alert("User deleted successfully!");
                } else {
                    throw new Error("Failed to delete user.");
                }
            } catch (error) {
                alert("Error deleting user!");
            }
        }
    }

    // Open Add User Modal
    addUserBtn.addEventListener("click", () => {
        editMode = false;
        showModal();
    });

    // Close Modal
    closeModal.addEventListener("click", hideModal);
    window.onclick = (event) => { if (event.target == modal) hideModal(); };

    // Initial fetch
    fetchUsers();
});
