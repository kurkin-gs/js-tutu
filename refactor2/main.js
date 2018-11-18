function drawRating(vote) {
    const MAX_RATE = 100,
            STARS_COUNT = 5;
    vote = vote > MAX_RATE ? MAX_RATE : vote < 0 ? 0 : vote;
    let stars = Math.ceil(vote * STARS_COUNT / MAX_RATE) || 1;
    return "★".repeat(stars) + "☆".repeat(STARS_COUNT - stars);
}

console.log(drawRating(0));
console.log(drawRating(1));
console.log(drawRating(50));
console.log(drawRating(99));