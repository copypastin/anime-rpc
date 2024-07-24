const OTHERURLS = ["/upcoming", "/upcoming", "/ongoing", "/added", "/updated", "/filter", "/genre"]

const linkFilter = (link) => {
    let found = false;
     OTHERURLS.forEach(URL => {
        if (link.includes(URL)) found = true
    });
    return found;
}


module.exports = { linkFilter };