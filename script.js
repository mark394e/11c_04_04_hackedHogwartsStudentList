"use strict";

document.addEventListener("DOMContentLoaded", init);

// creating empty array for cleaned up data
const studentArray = [];

let students = [];

let expelledStudents = [];

const JSONArray = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodJSON = "https://petlatkea.dk/2021/hogwarts/families.json";

// creating object-prototype for students
const Student = {
  firstname: "",
  nickname: "",
  middlename: "",
  lastname: "",
  gender: "",
  house: "",
  image: "",
  blood: "",
  expelled: false,
  prefect: false,
  in_squad: false,
};

const settings = {
  filter: "all",
  sortBy: "firstname-az",
};

let filterBy = "all";

async function init() {
  console.log("ready");
  registerFilterButtons();
  registerSearchBar();
  loadStudents();
}

function registerSearchBar() {
  const searchInput = document.querySelector("[data-search]");

  searchInput.addEventListener("input", (event) => {
    const value = event.target.value.toLowerCase();
    students.forEach((student) => {
      const isVisible = student.firstname.toLowerCase().includes(value) || student.lastname.toLowerCase().includes(value);
      student.element.classList.toggle("hide", !isVisible);
    });
  });
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

    loadBloodStatus();

    async function loadBloodStatus() {
      const response = await fetch(bloodJSON);
      const studentBloodJSON = await response.json();

      student.bloodStatus = checkBloodStatus(studentBloodJSON);
    }

    function checkBloodStatus(studentBloodJSON) {
      if (studentBloodJSON.pure.includes(student.lastname) == true) {
        return "Pureblood";
      } else if (studentBloodJSON.half.includes(student.lastname) == true) {
        return "Halfblood";
      } else {
        return "Muggle-born";
      }
    }

    // adding all the student-objects to the student array
    studentArray.push(student);
  });

  buildStudentList();
  showNumberOfStudents();
}

function showNumberOfStudents() {
  document.querySelector("#numberofstudents").textContent = `Attending students: ${studentArray.length}`;
}

function displayStudents(studentArray) {
  const studentListView = document.querySelector("#list-wrapper");
  studentListView.textContent = "";

  students = studentArray.map((student) => {
    const template = document.querySelector("#student");
    const klon = template.cloneNode(true).content.children[0];

    klon.querySelector(".firstName").textContent = `Firstname: ${student.firstname}`;

    if (student.lastname != "") {
      klon.querySelector(".lastName").textContent = `Lastname: ${student.lastname}`;
    }

    klon.querySelector(".gender").textContent = `Gender: ${student.gender}`;
    klon.querySelector(".house").textContent = `House: ${student.house}`;
    klon.querySelector(".image").src = `images/${student.image}`;

    if (student.expelled === true) {
      klon.querySelector("#expell").textContent = "Expelled";
    } else {
      klon.querySelector("#expell").textContent = "Expell";
    }

    if (student.prefect === true) {
      klon.querySelector("#prefect").textContent = "Is Prefect";
    } else {
      klon.querySelector("#prefect").textContent = "Make Prefect";
    }

    if (student.in_squad === true) {
      klon.querySelector("#in-squad").textContent = "Is in Squad";
    } else {
      klon.querySelector("#in-squad").textContent = "Inquisitorial Squad";
    }

    klon.querySelector("#in-squad").addEventListener("click", clickInSquad);

    function clickInSquad() {
      console.log("clickInSquad");
      if (student.in_squad === true) {
        student.in_squad = false;
      } else if (student.expelled === true) {
        alert("This student is expelled");
      } else if (student.house === "Slytherin" || student.bloodStatus === "Pureblood") {
        student.in_squad = true;
      } else {
        alert("This student is not Pureblood or Slytherin");
      }

      buildStudentList();
    }

    klon.querySelector("#prefect").addEventListener("click", clickPrefect);

    function clickPrefect() {
      if (student.prefect === true) {
        student.prefect = false;
      } else if (student.expelled === true) {
        alert("This student is expelled");
      } else {
        tryToMakeAPrefect(student);
      }

      buildStudentList();
    }

    klon.querySelector("#expell").addEventListener("click", clickExpell);

    function clickExpell() {
      klon.querySelector("#expell").removeEventListener("click", clickExpell);
      if (student.expelled === true) {
        alert("Student is already expelled");
      } else {
        student.in_squad = false;
        student.prefect = false;
        studentArray.splice(studentArray.indexOf(student), 1);
        student.expelled = true;
        expelledStudents.push(student);
      }

      buildStudentList();
    }

    if (student.house === "Gryffindor") {
      klon.style.backgroundColor = "#660000";
      klon.style.border = "4px solid #e09c09";
      klon.querySelector("#housecrest").src = `housecrest/${student.house}.png`;
    } else if (student.house === "Hufflepuff") {
      klon.style.backgroundColor = "#ff9d0b";
      klon.style.border = "4px solid #1f1e19";
      klon.querySelector("#housecrest").src = `housecrest/${student.house}.png`;
    } else if (student.house === "Slytherin") {
      klon.style.backgroundColor = "#2f751c";
      klon.style.border = "4px solid #cccccc";
      klon.querySelector("#housecrest").src = `housecrest/${student.house}.png`;
    } else if (student.house === "Ravenclaw") {
      klon.style.backgroundColor = "#8e501d";
      klon.style.border = "4px solid #1a3956";
      klon.querySelector("#housecrest").src = `housecrest/${student.house}.png`;
    }

    klon.querySelector("#studentpic").addEventListener("click", () => showDetails(student));
    studentListView.appendChild(klon);

    return { firstname: student.firstname, lastname: student.lastname, element: klon };
  });
}

function showDetails(student) {
  const popup = document.querySelector("#popup");
  const popupArticle = document.querySelector("#popup article");
  popup.style.display = "block";

  if (student.house === "Gryffindor") {
    popupArticle.style.backgroundColor = "#660000";
    popupArticle.style.border = "4px solid #e09c09";
  } else if (student.house === "Hufflepuff") {
    popupArticle.style.backgroundColor = "#ff9d0b";
    popupArticle.style.border = "4px solid #1f1e19";
  } else if (student.house === "Slytherin") {
    popupArticle.style.backgroundColor = "#2f751c";
    popupArticle.style.border = "4px solid #cccccc";
  } else if (student.house === "Ravenclaw") {
    popupArticle.style.backgroundColor = "#8e501d";
    popupArticle.style.border = "4px solid #1a3956";
  }

  popup.querySelector(".firstName").textContent = `Firstname: ${student.firstname}`;
  popup.querySelector(".lastName").textContent = `Lastname: ${student.lastname}`;

  if (student.middlename != "") {
    popup.querySelector(".middleName").textContent = `Middlename: ${student.middlename}`;
  } else {
    popup.querySelector(".middleName").textContent = "";
  }

  if (student.nickname != "") {
    popup.querySelector(".nickName").textContent = `Nickname: ${student.nickname}`;
  } else {
    popup.querySelector(".nickName").textContent = "";
  }

  popup.querySelector(".gender").textContent = `Gender: ${student.gender}`;
  popup.querySelector(".house").textContent = `House: ${student.house}`;
  popup.querySelector(".image").src = `images/${student.image}`;
  popup.querySelector(".blood").textContent = `Bloodstatus: ${student.bloodStatus}`;

  if (student.expelled === true) {
    document.querySelector(".expelled").textContent = "Expelled: Yes";
  } else {
    document.querySelector(".expelled").textContent = "Expelled: No";
  }

  if (student.in_squad === true) {
    document.querySelector(".squad").textContent = "Inquisitorial Squad: Yes";
  } else {
    document.querySelector(".squad").textContent = "Inquisitorial Squad: No";
  }

  document.querySelector("#luk").addEventListener("click", () => (popup.style.display = "none"));
}

function tryToMakeAPrefect(selectedStudent) {
  const prefects = studentArray.filter((student) => student.prefect);

  const numberOfPrefects = prefects.length;

  const otherStudent = prefects.filter((student) => student.gender === selectedStudent.gender && student.house === selectedStudent.house).shift();

  if (otherStudent !== undefined) {
    removeOtherStudent(otherStudent);
  } else {
    makePrefect(selectedStudent);
  }

  function removeOtherStudent(otherStudent) {
    // displaying dialog box
    document.querySelector("#remove_other").classList.remove("hide");

    document.querySelector("#remove_button").addEventListener("click", clickRemoveButton);

    // if ignoring dialog box
    document.querySelector("#remove_other .closebutton").addEventListener("click", closeDialog);

    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_button").removeEventListener("click", clickRemoveButton);
      document.querySelector("#remove_other .closebutton").removeEventListener("click", closeDialog);
    }

    // if removing other prefect student
    function clickRemoveButton() {
      removePrefect(otherStudent);
      makePrefect(selectedStudent);
      buildStudentList();
      closeDialog();
    }
  }
  function removeAorB(prefectA, prefectB) {
    console.log("remove a or b");
    // if removeA:
    removePrefect(prefectA);
    makePrefect(selectedStudent);

    // else if removeB:
    removePrefect(prefectB);
    makePrefect(selectedStudent);
  }
  function removePrefect(prefectStudent) {
    prefectStudent.prefect = false;
  }
  function makePrefect(student) {
    student.prefect = true;
  }
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
    filteredStudents = expelledStudents;
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
