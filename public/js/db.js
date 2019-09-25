//offline data
db.enablePersistence()
.catch(err =>{
    if(err.code == 'failed-precondition'){
        //probably multipe tabs open at once
        console.log('persistence failed.');
    }
    else if(err.code == 'inimplemented'){
        //lack of browser support
        console.log('persistence is not available.');
    }
})

//real-time listner
db.collection('recipes').onSnapshot((snapshot)=>{
    //console.log(snapshot.docChanges());
    snapshot.docChanges().forEach(change =>{
        //console.log(change,change.doc.data(),change.doc.id);
        if(change.type == "added"){
            renderRecipe(change.doc.data(),change.doc.id);
        }
        if(change.type == "removed"){
            removeRecipe(change.doc.id);
        }
    });
})

//add recipe
const form = document.querySelector('form');
form.addEventListener('submit', evt =>{
    evt.preventDefault();
if(form.title.value.trim() !== "" && form.ingredients.value.trim() !== ""){
    const recipe = {
        title : form.title.value,
        ingredients : form.ingredients.value

    }
    db.collection('recipes').add(recipe)
        .catch(err => console.log(err) );
    //clear the values
    form.title.value = "";
    form.ingredients.value = "";
}
else{
    alert("enter title and ingredients.")
}
  

});

//delete recipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', evt =>{
    if(evt.target.tagName === "I"){
        const id = evt.target.getAttribute('data-id');
        db.collection('recipes').doc(id).delete();
    }
})
