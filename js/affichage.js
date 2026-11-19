
import { api_url } from "./config.js";

let movies = [];

const list = document.querySelector("#list");
const form = document.querySelector("#form");
const message = document.querySelector("#message");
const errors = document.querySelector("#errors");
const form_title = document.querySelector("#form_title");

const id_input = document.querySelector("#id");
const title_input = document.querySelector("#title");
const type_input = document.querySelector("#type");
const year_input = document.querySelector("#year");
const genres_input = document.querySelector("#genres");
const image_input = document.querySelector("#image");
const description_input = document.querySelector("#description");

function show_message(text, color) {
    message.textContent = text;
    message.className = "mb-3 text-sm " + color;
}

function show_list() {
    list.innerHTML = "";

    movies.map(function (movie) {
        const row = document.createElement("tr");

        const title = document.createElement("td");
        title.className = "p-2";
        title.textContent = movie.title;

        const type = document.createElement("td");

        if (movie.type === "series") {
            type.textContent = "Série";
        } else {
            type.textContent = "Film";
        }

        const year = document.createElement("td");
        year.textContent = movie.releaseYear;

        const actions = document.createElement("td");

        const edit_button = document.createElement("button");
        edit_button.textContent = "Modifier";
        edit_button.className = "edit text-blue-400";
        edit_button.dataset.id = movie.id;

        const delete_button = document.createElement("button");
        delete_button.textContent = "Supprimer";
        delete_button.className = "delete ml-2 text-red-500";
        delete_button.dataset.id = movie.id;

        actions.appendChild(edit_button);
        actions.appendChild(delete_button);

        row.appendChild(title);
        row.appendChild(type);
        row.appendChild(year);
        row.appendChild(actions);

        list.appendChild(row);
    });
}

function validate() {
    const problems = [];

    if (title_input.value.trim().length < 2) {
        problems.push("Le titre doit contenir au moins 2 caractères.");
    }

    if (year_input.value < 1888 || year_input.value > 2030) {
        problems.push("L'année n'est pas valide.");
    }

    if (genres_input.value.trim() === "") {
        problems.push("Le genre est obligatoire.");
    }

    if (!image_input.value.startsWith("http")) {
        problems.push("L'URL de l'image doit commencer par http.");
    }

    if (description_input.value.trim().length < 10) {
        problems.push("La description doit contenir au moins 10 caractères.");
    }

    errors.innerHTML = problems.map(function (problem) {
        return "<li>" + problem + "</li>";
    }).join("");

    if (problems.length === 0) {
        return true;
    } else {
        return false;
    }
}

function reset_form() {
    form.reset();
    id_input.value = "";
    form_title.textContent = "Ajouter";
}

async function load_movies() {
    show_message("Chargement...", "text-gray-400");

    try {
        const res = await fetch(api_url);

        if (!res.ok) {
            throw new Error("Erreur " + res.status);
        }

        const data = await res.json();

        movies = data;

        show_list();

        show_message(movies.length + " film(s) et série(s)", "text-gray-400");

    } catch (error) {
        show_message("Erreur : " + error.message, "text-red-400");
    }
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const is_valid = validate();

    if (is_valid === false) {
        return;
    }

    const movie = {
        title: title_input.value.trim(),
        type: type_input.value,
        releaseYear: Number(year_input.value),
        genres: genres_input.value.split(",").map(function (genre) {
            return genre.trim();
        }),
        image: image_input.value.trim(),
        description: description_input.value.trim()
    };

    const id = id_input.value;

    let url = api_url;
    let method = "POST";

    if (id !== "") {
        url = api_url + "/" + id;
        method = "PUT";
    }

    show_message("Enregistrement...", "text-gray-400");

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(movie)
        });

        if (!res.ok) {
            throw new Error("Erreur " + res.status);
        }

        reset_form();

        await load_movies();

        if (id !== "") {
            show_message("Modifié avec succès.", "text-green-400");
        } else {
            show_message("Ajouté avec succès.", "text-green-400");
        }

    } catch (error) {
        show_message("Erreur : " + error.message, "text-red-400");
    }
});

list.addEventListener("click", async function (event) {

    const edit_button = event.target.closest(".edit");
    const delete_button = event.target.closest(".delete");

    if (edit_button) {

        const id = edit_button.dataset.id;

        const movie = movies.find(function (item) {
            return item.id === id;
        });

        if (movie) {
            id_input.value = movie.id;
            title_input.value = movie.title;
            type_input.value = movie.type;
            year_input.value = movie.releaseYear;
            genres_input.value = movie.genres.join(", ");
            image_input.value = movie.image;
            description_input.value = movie.description;

            form_title.textContent = "Modifier";
        }
    }

    if (delete_button) {

        const id = delete_button.dataset.id;

        const confirmation = confirm("Voulez-vous vraiment supprimer ?");

        if (confirmation === false) {
            return;
        }

        try {
            const res = await fetch(api_url + "/" + id, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Erreur " + res.status);
            }

            await load_movies();

            show_message("Supprimé avec succès.", "text-green-400");

        } catch (error) {
            show_message("Erreur : " + error.message, "text-red-400");
        }
    }
});

load_movies();
