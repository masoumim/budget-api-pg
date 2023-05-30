// Generates and returns a new ID for an object
function generateId(objectArray) {
    let searchForId = true;
    let newId = 1;

    // Check each element's ID value until we reach one that isn't in use.
    while (searchForId) {
        let checkId = objectArray.findIndex((element) => { return element.id === newId });
        if (checkId !== -1) {
            newId++;
        }
        else {
            searchForId = false;
        }
    }
    return newId;
}



// Export the utility functions
module.exports = {
    generateId
};