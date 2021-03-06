import io from "socket.io-client";

// The socket needs to know which server to connect to. window.location.origin
// is just the same server that served this webpage.
const socket = io(window.location.origin);

const usersList = document.getElementById("users-list");
const newUserForm = document.getElementById("new-user-form");

// Here's our client-side data store - it's an array
let users = [];

// Instead of React, how about we just re-render everything all the time!
const renderUsers = () => {
  usersList.innerHTML = "";
  users.forEach((user) => {
    const userCard = document.createElement("div");
    userCard.classList.add("user-card");
    userCard.innerHTML = `
      <img src="https://www.countryflags.io/${user.favDestination}/shiny/64.png">
      <h4>ISO code: ${user.favDestination}</h4>
      <h2>${user.name}</h2>
    `;
    usersList.appendChild(userCard);
  });
};
renderUsers();

// When we submit a form,
newUserForm.onsubmit = (event) => {
  event.preventDefault();
  const name = document.getElementById("new-user-name").value;
  const favDestination = document.getElementById("destination").value;
  if (!name || !favDestination) {
    alert("Name and destination are mandatory");
    return;
  }
  const newUser = { name, favDestination };

  // Update the local state
  users.push(newUser);

  // Re-render with the updated state
  renderUsers();

  // Send the new data to the server over TCP
  socket.emit("new-user", newUser);

  // Clear the form
  document.getElementById("new-user-name").value = "";
  document.getElementById("new-user-fav-destination").value = "";
};

// When the socket first connects, let's sync up with the server.
socket.on("connect", () => {
  console.log("I am now connected to the server!");

  // When the server sends over all of the users, we'll just replace
  // whatever we've got with what the server sent us over the socket.
  socket.on("all-users", (allUsers) => {
    console.log("received all users", allUsers);
    users = allUsers;
    renderUsers();
  });

  // When the server sends us a new user, update our data store and re-render
  socket.on("new-user", (user) => {
    console.log("Got new user", user);
    users.push(user);
    renderUsers();
  });
});
