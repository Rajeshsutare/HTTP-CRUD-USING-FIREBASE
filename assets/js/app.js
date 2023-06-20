
const cl = console.log;


const postContainer = document.getElementById('postContainer')
const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title')
const contentControl = document.getElementById('content')
const resetBtn = document.getElementById('resetBtn')
const submitBtn = document.getElementById('submitBtn')
const updateBtn = document.getElementById('updateBtn')
const loader = document.getElementById('loader')


const baseUrl = `https://my-project-410e0-default-rtdb.asia-southeast1.firebasedatabase.app`;

let postUrl = `${baseUrl}/post.json`;

let postArray = [];

const templating = (arr) =>{
    let result = '';
    arr.forEach(ele => {
        result += `
    <div class="card mb-4" id='${ele.id}'>
        <div class="card-header">
            <h3>${ele.title}</h3>
        </div>
            <div class="card-body">
                <p>${ele.content}</p>
            </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-warning " type="button" onClick ='onEdit(this)'>Edit</button>
                    <button class="btn btn-danger" type="button" onClick ='onDelete(this)' >Delete</button>
                </div>
    </div>
        `;
        
    });
    postContainer.innerHTML=result;
}

const makeApiCall = (method,apiUrl, body) =>{
    loader.classList.remove('d-none')
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open (method, apiUrl)
        xhr.setRequestHeader('auth', 'bearer Token From LocalStorages')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.onload = function(){
            if(xhr.status >= 200 || xhr.status <= 300){
                resolve(xhr.response)
            }else{
                reject('something went wrong')
            }
        }
        xhr.send(JSON.stringify(body));
    })
}

makeApiCall('GET', postUrl)
.then(res=>{
    cl(res)
    
    let data = JSON.parse(res)
    for(let k in data){
        let obj = {
            ...data[k],
            id : k
        }
        postArray.push(obj)
    }
    templating(postArray)
    loader.classList.add('d-none')
})
.catch(err=>{
    cl(err)

})
.finally(()=>{
    loader.classList.add('d-none')
})

postForm.addEventListener("submit", (eve)=>{
    eve.preventDefault();
    let obj = {
        title : titleControl.value.trim(),
        content : contentControl.value.trim()
    }
    makeApiCall('POST', postUrl, obj)
        .then(res=>{
            cl(res)
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Post Created Successfully!!!',
                showConfirmButton: true,
                timer: 3000
            })
            let data = JSON.parse(res)
            let card = document.createElement('div')
            card.id = data.name;
            card.className = 'card mb-4'
            card.innerHTML = `
                <div class="card-header">
                    <h3>${obj.title}</h3>
                </div>  
                <div class="card-body">
                    <p>${obj.content}</p>
                </div>
                <div class="card-footer ">
                        <button class="btn btn-warning " type="button" onClick ='onEdit(this)'>Edit</button>
                        <button class="btn btn-danger" type="button" onClick ='onDelete(this)' >Delete</button>
                </div>
                    
                `;
                postContainer.prepend(card)
               
                postForm.reset();
        })
        .catch(err=>{
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'something went wrong!!!',
                showConfirmButton: true,
                timer: 3000
            })
        })
        .finally(()=>{
            loader.classList.add('d-none')
        })
})


const onEdit = (e) =>{
    let editId = e.closest('.card').id;
    localStorage.setItem('editId',editId)
    let editUrl = `${baseUrl}/post/${editId}.json`;

    makeApiCall('GET', editUrl)
    .then(res=>{
        cl(res)
        let card = JSON.parse(res)
        titleControl.value = card.title;
        contentControl.value = card.content;
    })
    .catch(err=>{
        cl(err)
    })
    .finally(()=>{
        submitBtn.classList.add('d-none')
        updateBtn.classList.remove('d-none')
        loader.classList.add('d-none')
    })
}


updateBtn.addEventListener("click", (e)=>{
    let updateId = localStorage.getItem('editId')
    let updateUrl = `${baseUrl}/post/${updateId}.json`
    let obj = {
            title : titleControl.value,
            content : contentControl.value
    }
    makeApiCall('PATCH', updateUrl, obj)
    .then(res=>{
        cl(res)
        let card = [...document.getElementById(updateId).children]
        card[0].innerHTML=`<h3>${obj.title}</h3>`;
        card[1].innerHTML=`<p>${obj.content}</p>`;
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Post Updated Successfully!!!',
            showConfirmButton: true,
            timer: 3000
        })
    })
    .catch(err=>{
        cl(err)
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: err,
            showConfirmButton: false,
            timer: 3000
        })
    })
    .finally(()=>{
        submitBtn.classList.remove('d-none')
        updateBtn.classList.add('d-none')
        postForm.reset();
        loader.classList.add('d-none')
    })
})


const onDelete = (e) =>{
    let deleteId = e.closest('.card').id;
    let deleteUrl = `${baseUrl}/post/${deleteId}.json`
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall('DELETE', deleteUrl)
        .then(res=>{
            cl(res)
            let deletedCard = document.getElementById(deleteId).remove();
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Post Deleted Successfully!!!',
                showConfirmButton: true,
                timer: 3000
            })
        })
        }else{
        return;
        }
    })
    .catch(err=>{
        cl(err)
    })
    .finally(()=>{
        loader.classList.add('d-none')
    })  
}


