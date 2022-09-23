"use strict";

document.addEventListener("DOMContentLoaded", init);

// creating empty array for cleaned up data
const studentArray = [];

const JSONArray = "https://petlatkea.dk/2021/hogwarts/students.json";

// creating object-protorype for data
const Student = {
  firstname: "",
  nickname: "",
  middlename: "",
  lastname: "",
  gender: "",
  house: "",
  image: "",
  expelled: false,
};

const settings = {
  filter: "all",
  sortBy: "firstname-az",
};

let filterBy = "all";

async function init() {
  console.log("ready");
  registerFilterButtons();

  loadStudents();
}

function registerFilterButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((filterButton) => {
    filterButton.addEventListener("click", selectFilter);
  });

  document.querySelectorAll("[data-action='sort']").forEach((sortOption) => {
    sortOption.addEventListener("click", selectSort);
  });
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  setFilter(filter);
}

function selectSort(event) {
  const sortBy = event.target.value;
  setSort(sortBy);
}

function setSort(sortBy) {
  settings.sortBy = sortBy;
  buildStudentList();
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildStudentList();
}

function buildStudentList() {
  const currentStudentList = filterStudents(studentArray);
  const sortedStudentList = sortStudents(currentStudentList);

  displayStudents(sortedStudentList);
}

// fetching data from JSON and logging array in a table
async function loadStudents() {
  const response = await fetch(JSONArray);
  const studentList = await response.json();
  prepareStudents(studentList);
}

function prepareStudents(studentList) {
  // for each elm/student in the array, create a new object with the Student-object-prototype
  studentList.forEach((elm) => {
    const student = Object.create(Student);

    // trim every name, house and gender - making sure there's no space in front or behind
    let fullName = elm.fullname.trim();
    let house = elm.house.trim();
    let gender = elm.gender.trim();

    // defining the firstname property. capitalises the first letter in the first name and lowering the rest
    student.firstname = fullName.substring(0, 1).toUpperCase() + fullName.substring(1, fullName.indexOf(" ")).toLowerCase();

    // if the fullName does not include a space then capitalise the first letter in the name and lower the rest
    if (fullName.includes(" ") === false) {
      student.firstname = fullName.substring(0, 1).toUpperCase() + fullName.substring(1).toLowerCase();
    }

    // defining the middlename property. trimming the middlename and capitalising the first letter and lowering the rest
    student.middlename = fullName.substring(fullName.indexOf(" "), fullName.lastIndexOf(" ")).trim().substring(0, 1).toUpperCase() + fullName.substring(fullName.indexOf(" "), fullName.lastIndexOf(" ")).trim().substring(1).toLowerCase();

    // if the fullName includes " then define the word betwen the two " as a nickname as well as capitalising it
    // as well as defining the nickname property
    if (fullName.includes(`"`)) {
      student.nickname = fullName.substring(fullName.indexOf(`"`) + 1, fullName.indexOf(`"`) + 2).toUpperCase() + fullName.substring(fullName.indexOf(`"`) + 2, fullName.lastIndexOf(`"`)).toLowerCase();
      // removing the name from the middlename because its a nickname
      student.middlename = "";
    }

    // defining the lastname property. capitalising the first letter in lastname and lowering the rest
    student.lastname = fullName.substring(fullName.lastIndexOf(" ") + 1, fullName.lastIndexOf(" ") + 2).toUpperCase() + fullName.substring(fullName.lastIndexOf(" ") + 2).toLowerCase();

    if (fullName.includes(" ") === false) {
      student.lastname = "";
    }
    // ------------------------------ TODO: -------------------------------- //

    // if (student.lastname.includes("-")) {
    //   student.lastname = fullName.substring(fullName.lastIndexOf("-") + 1).toUpperCase() + fullName.substring(fullName.lastIndexOf("-") + 2).toLowerCase();
    // }

    // --------------------------------------------------------------------- //

    // defining the gender property. capitalising the first letter in gender and lowering the rest
    student.gender = gender.substring(0, 1).toUpperCase() + gender.substring(1).toLowerCase();

    // defining the house property. capitalising the first letter in gender and lowering the rest
    student.house = house.substring(0, 1).toUpperCase() + house.substring(1).toLowerCase();

    // defining the image property. concatenating the last name in lower case with an underscore and the first letter in the first name in lower case with ".png"
    student.image = fullName.substring(fullName.lastIndexOf(" ")).trim().toLowerCase() + "_" + fullName.substring(0, 1).toLowerCase() + ".png";

    // if the fullName includes a hyphen then lower the letters in the last name after the hyphen and add the underscore, first letter of first name in lower case and ".png"
    if (fullName.includes("-")) {
      student.image = fullName.substring(fullName.lastIndexOf("-") + 1).toLowerCase() + "_" + fullName.substring(0, 1).toLowerCase() + ".png";
    }

    if (fullName.includes("Patil")) {
      student.image = fullName.substring(fullName.lastIndexOf(" ")).trim().toLowerCase() + "_" + fullName.substring(0, fullName.indexOf(" ")).trim().toLowerCase() + ".png";
    }

    // adding all the student-objects to the student array
    studentArray.push(student);
  });

  buildStudentList();
}

function displayStudents(studentArray) {
  const studentListView = document.querySelector("#list-wrapper");
  studentListView.textContent = "";

  studentArray.forEach((student) => {
    const template = document.querySelector("#student");
    let klon = template.cloneNode(true).content;

    klon.querySelector(".firstName").textContent = `Firstname: ${student.firstname}`;

    if (student.lastname != "") {
      klon.querySelector(".lastName").textContent = `Lastname: ${student.lastname}`;
    }

    if (student.middlename != "") {
      klon.querySelector(".middleName").textContent = `Middlename: ${student.middlename}`;
    }

    if (student.nickname != "") {
      klon.querySelector(".nickName").textContent = `Nickname: ${student.nickname}`;
    }
    klon.querySelector(".gender").textContent = `Gender: ${student.gender}`;
    klon.querySelector(".house").textContent = `House: ${student.house}`;
    klon.querySelector(".image").src = `images/${student.image}`;

    if (student.expelled === true) {
      klon.querySelector("#expell").textContent = "❌";
    } else {
      klon.querySelector("#expell").textContent = "✅";
    }

    klon.querySelector("#expell").addEventListener("click", clickExpell);

    function clickExpell() {
      console.log("clickExpell");
      if (student.expelled === true) {
        student.expelled = false;
      } else {
        student.expelled = true;
      }

      buildStudentList();
    }

    klon.querySelector("#studentpic").addEventListener("click", () => showDetails(student));
    studentListView.appendChild(klon);
  });
}

function showDetails(student) {
  //   console.log("POP! POP!");

  const popup = document.querySelector("#popup");
  popup.style.display = "block";

  popup.querySelector(".firstName").textContent = `Firstname: ${student.firstname}`;
  popup.querySelector(".lastName").textContent = `Lastname: ${student.lastname}`;

  if (student.middlename != "") {
    popup.querySelector(".middleName").textContent = `Middlename: ${student.middlename}`;
  }

  if (student.nickname != "") {
    popup.querySelector(".nickName").textContent = `Nickname: ${student.nickname}`;
  }

  popup.querySelector(".gender").textContent = `Gender: ${student.gender}`;
  popup.querySelector(".house").textContent = `House: ${student.house}`;
  popup.querySelector(".image").src = `images/${student.image}`;

  document.querySelector("#luk").addEventListener("click", () => (popup.style.display = "none"));
}

function filterStudents(filteredStudents) {
  if (settings.filterBy === "gryffindor") {
    filteredStudents = studentArray.filter(isGryffindor);
  } else if (settings.filterBy === "hufflepuff") {
    filteredStudents = studentArray.filter(isHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredStudents = studentArray.filter(isRavenclaw);
  } else if (settings.filterBy === "slytherin") {
    filteredStudents = studentArray.filter(isSlytherin);
  } else if (settings.filterBy === "attending") {
    filteredStudents = studentArray.filter(isAttending);
  } else if (settings.filterBy === "expelled") {
    filteredStudents = studentArray.filter(isExpelled);
  }

  return filteredStudents;
}

function sortStudents(sortedStudentList) {
  if (settings.sortBy === "firstname-az") {
    sortedStudentList = sortedStudentList.sort(sortByFirstnameAZ);
  } else if (settings.sortBy === "firstname-za") {
    sortedStudentList = sortedStudentList.sort(sortByFirstnameZA);
  } else if (settings.sortBy === "lastname-az") {
    sortedStudentList = sortedStudentList.sort(sortByLastnameAZ);
  } else if (settings.sortBy === "lastname-za") {
    sortedStudentList = sortedStudentList.sort(sortByLastnameZA);
  } else if (settings.sortBy === "house-az") {
    sortedStudentList = sortedStudentList.sort(sortByHouseAZ);
  } else if (settings.sortBy === "house-za") {
    sortedStudentList = sortedStudentList.sort(sortByHouseZA);
  }
  return sortedStudentList;

  function sortByFirstnameAZ(studentA, studentB) {
    if (studentA.firstname > studentB.firstname) {
      return 1;
    } else {
      return -1;
    }
  }

  function sortByFirstnameZA(studentA, studentB) {
    if (studentA.firstname < studentB.firstname) {
      return 1;
    } else {
      return -1;
    }
  }

  function sortByLastnameAZ(studentA, studentB) {
    if (studentA.lastname > studentB.lastname) {
      return 1;
    } else {
      return -1;
    }
  }

  function sortByLastnameZA(studentA, studentB) {
    if (studentA.lastname < studentB.lastname) {
      return 1;
    } else {
      return -1;
    }
  }

  function sortByHouseAZ(studentA, studentB) {
    if (studentA.house > studentB.house) {
      return 1;
    } else {
      return -1;
    }
  }

  function sortByHouseZA(studentA, studentB) {
    if (studentA.house < studentB.house) {
      return 1;
    } else {
      return -1;
    }
  }
}

function isGryffindor(student) {
  return student.house === "Gryffindor";
}

function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}

function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}

function isSlytherin(student) {
  return student.house === "Slytherin";
}

function isExpelled(student) {
  return student.expelled === true;
}

function isAttending(student) {
  return student.expelled === false;
}
