
import { api_url } from "./config.js";

const comments_url = api_url.replace("/movies", "/comments");
const ratings_url = api_url.replace("/movies", "/ratings");

async function get_data(url, movie_id) {
    const res = await fetch(url + "?movieId=" + movie_id);

    if (res.status === 404) {
        return [];
    }

    if (!res.ok) {
        throw new Error("Erreur serveur");
    }

    return await res.json();
}

async function add_data(url, data) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("Erreur serveur");
    }

    return await res.json();
}

async function load_details(movie_id) {
    const box = document.createElement("div");

    box.className = "mt-4 border-t border-gray-700 pt-3";

    box.innerHTML = `
        <div class="rating mb-3"></div>

        <h3 class="mb-2 text-sm font-bold">Commentaires</h3>
        <div class="comments space-y-2 text-sm"></div>

        <form class="mt-3 space-y-2">
            <input class="author w-full rounded bg-[#25252e] p-2 text-sm outline-none" placeholder="Votre nom">
            <textarea class="text w-full rounded bg-[#25252e] p-2 text-sm outline-none" rows="2" placeholder="Votre commentaire"></textarea>
            <p class="msg text-xs text-red-400"></p>
            <button class="w-full rounded bg-red-600 p-2 text-sm">Publier</button>
        </form>
    `;

    document.querySelector("#modalContent").appendChild(box);

    const rating_box = box.querySelector(".rating");
    const comments_box = box.querySelector(".comments");
    const form = box.querySelector("form");
    const msg = box.querySelector(".msg");

    let comments = [];
    let ratings = [];

    function show_comments() {
        comments_box.innerHTML = "";

        if (comments.length === 0) {
            comments_box.textContent = "Aucun commentaire.";
            return;
        }

        comments.map(function (comment) {
            const item = document.createElement("div");
            item.className = "rounded bg-[#25252e] p-2";

            const author = document.createElement("p");
            author.textContent = comment.author;
            author.className = "text-xs font-bold";

            const text = document.createElement("p");
            text.textContent = comment.text;
            text.className = "text-gray-300";

            item.appendChild(author);
            item.appendChild(text);

            comments_box.appendChild(item);
        });
    }

    function show_ratings() {
        let total = 0;

        ratings.forEach(function (rating) {
            total = total + Number(rating.value);
        });

        let average = 0;

        if (ratings.length > 0) {
            average = total / ratings.length;
        }

        rating_box.innerHTML = "";

        for (let i = 1; i <= 5; i++) {
            let color = "text-gray-600";

            if (i <= Math.round(average)) {
                color = "text-yellow-400";
            }

            rating_box.innerHTML += `
                <button class="star text-2xl ${color}" data-value="${i}">★</button>
            `;
        }

        if (ratings.length > 0) {
            rating_box.innerHTML += `
                <p class="text-xs text-gray-400">
                    ${average.toFixed(1)} / 5 (${ratings.length} avis)
                </p>
            `;
        } else {
            rating_box.innerHTML += `
                <p class="text-xs text-gray-400">Aucune note</p>
            `;
        }
    }

    try {
        comments = await get_data(comments_url, movie_id);
        ratings = await get_data(ratings_url, movie_id);

        show_comments();
        show_ratings();

    } catch (error) {
        comments_box.textContent = "Erreur : " + error.message;
    }

    rating_box.addEventListener("click", async function (event) {
        const star = event.target.closest(".star");

        if (star) {
            try {
                const rating = await add_data(ratings_url, {
                    movieId: movie_id,
                    value: Number(star.dataset.value)
                });

                ratings.push(rating);
                show_ratings();

            } catch (error) {
                msg.textContent = error.message;
            }
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const author = form.querySelector(".author").value.trim();
        const text = form.querySelector(".text").value.trim();

        if (author.length < 2 || text.length < 3) {
            msg.textContent = "Remplissez tous les champs.";
            return;
        }

        try {
            const comment = await add_data(comments_url, {
                movieId: movie_id,
                author: author,
                text: text
            });

            comments.push(comment);

            show_comments();

            form.reset();
            msg.textContent = "";

        } catch (error) {
            msg.textContent = error.message;
        }
    });
}

document.addEventListener("click", function (event) {
    const button = event.target.closest(".details");

    if (button) {
        load_details(button.dataset.id);
    }
});
