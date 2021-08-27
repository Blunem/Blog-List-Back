
const blogHistogram = (keys) => {

    const oneKey = (histogram, currentEntry) => {

        const entry = histogram.find( entry => entry[keys.one] === currentEntry[keys.one])
        const hisFunction = (centry) => (centry[keys.one] === currentEntry[keys.one]? { ...centry,[keys.two]: centry[keys.two] + 1 } : centry )

        entry? histogram = histogram.map(hisFunction) : histogram.push({ [keys.one]: currentEntry[keys.one],[keys.two]:1 } )
        return histogram
    }
    return oneKey
}

const likesHistogram = (histogram, currentEntry) => {
    //Function declaration
    const finder = entry => entry.author === currentEntry.author
    const updateHistogram = (entry) => {
        return finder(entry)? { ...entry, likes: entry.likes + currentEntry.likes } : entry
    }

    //Implementation
    const exist = histogram.find(finder)
    exist? histogram = histogram.map(updateHistogram) : histogram.push({ ...currentEntry })
    return histogram
}


const maxKey = (key) => {
    const max = (max, current) => (max[key] > current[key]? max : current)
    return max
}

module.exports = {
    maxKey,
    likesHistogram,
    blogHistogram
}