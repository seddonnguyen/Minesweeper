export function fisherYatesSampling(array, k) {
    let currentIndex = array.length;
    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * currentIndex);

        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array.slice(-k);
}