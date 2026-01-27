const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const getMetaData = async (route, id) => {
    let title = 'News Marketplace';
    let description = 'Your one-stop destination for news and industry insights.';
    let image = 'https://vaas.solutions/logo.png'; // Default logo
    let url = `https://vaas.solutions/${route}/${id}`;

    try {
        switch (route) {
            case 'publications': {
                const res = await pool.query('SELECT publication_name, other_remarks FROM publications WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].publication_name;
                    description = res.rows[0].other_remarks || description;
                }
                break;
            }
            case 'events': {
                const res = await pool.query('SELECT event_name, event_description, event_image FROM events WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].event_name;
                    description = res.rows[0].event_description || description;
                    image = res.rows[0].event_image || image;
                }
                break;
            }
            case 'blog':
            case 'blogs': {
                const res = await pool.query('SELECT title, content, image FROM blogs WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].title;
                    description = res.rows[0].content ? res.rows[0].content.substring(0, 160) : description;
                    image = res.rows[0].image || image;
                }
                break;
            }
            case 'careers': {
                const res = await pool.query('SELECT job_title, job_description FROM careers WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].job_title;
                    description = res.rows[0].job_description || description;
                }
                break;
            }
            case 'themes': {
                const res = await pool.query('SELECT theme_name, theme_description, theme_image FROM themes WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].theme_name;
                    description = res.rows[0].theme_description || description;
                    image = res.rows[0].theme_image || image;
                }
                break;
            }
            case 'power-lists': {
                const res = await pool.query('SELECT list_title, list_description, list_image FROM powerlists WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].list_title;
                    description = res.rows[0].list_description || description;
                    image = res.rows[0].list_image || image;
                }
                break;
            }
            case 'paparazzi': {
                const res = await pool.query('SELECT title, description, image FROM paparazzi WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].title;
                    description = res.rows[0].description || description;
                    image = res.rows[0].image || image;
                }
                break;
            }
            case 'awards': {
                const res = await pool.query('SELECT award_name, award_description, award_image FROM awards WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].award_name;
                    description = res.rows[0].award_description || description;
                    image = res.rows[0].award_image || image;
                }
                break;
            }
            case 'real-estate-professionals': {
                const res = await pool.query('SELECT full_name, bio, profile_image FROM real_estate_professionals WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].full_name;
                    description = res.rows[0].bio || description;
                    image = res.rows[0].profile_image || image;
                }
                break;
            }
            case 'radio': {
                const res = await pool.query('SELECT station_name, description, logo FROM radios WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].station_name;
                    description = res.rows[0].description || description;
                    image = res.rows[0].logo || image;
                }
                break;
            }
            case 'podcasters': {
                const res = await pool.query('SELECT name, description, image FROM podcasters WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].name;
                    description = res.rows[0].description || description;
                    image = res.rows[0].image || image;
                }
                break;
            }
            case 'press-packs': {
                const res = await pool.query('SELECT pack_name, description, image FROM press_packs WHERE id = $1', [id]);
                if (res.rows[0]) {
                    title = res.rows[0].pack_name;
                    description = res.rows[0].description || description;
                    image = res.rows[0].image || image;
                }
                break;
            }
        }
    } catch (error) {
        console.error('Error fetching metadata:', error);
    }

    // Sanitize description (remove HTML tags if any)
    description = description.replace(/<[^>]*>?/gm, '').substring(0, 160);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${image}">

    <!-- Redirect to actual page for humans -->
    <script>
        window.location.href = "${url}";
    </script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${image}" alt="${title}">
</body>
</html>
  `;
};

module.exports = { getMetaData };
