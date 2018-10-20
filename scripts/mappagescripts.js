function toggleFilterPane() {
    document.getElementById("filterContainerSuper").style.display = "block";
    document.getElementById("mapContainerSuper").style.display = "none";
}

function toggleInputPane() {
    document.getElementById("inputContainerSuper").style.display = "block";
    document.getElementById("mapContainerSuper").style.display = "none";
}

function returnToMap() {
    document.getElementById("filterContainerSuper").style.display = "none";
    document.getElementById("inputContainerSuper").style.display = "none";
    document.getElementById("mapContainerSuper").style.display = "block";
}