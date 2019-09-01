//  http://tech.pro/tutorial/1383/javascript-one-language-to-rule-them-all

// cloud function and local image server
let cloud_function = "https://us-central1-revgcp-project1-trial.cloudfunctions.net/data_broker";
let image_server = "http://localhost:5000";

// image list
let image_list = [];

//===== table construction =====//
async function getmetadata() {
    let dbObject = { name: '', width:'', height:'', };
    let objectResponse = await fetch(cloud_function);
    if (objectResponse.status < 200 || objectResponse.status > 299) {
        let error = document.createElement('p');
        alert("fail");
        error.innerText = "Fetch Failed";
        document.getElementById('footer-table').appendChild(error);
    } else {
        let objectList = await objectResponse.json();
        objectList.forEach((v) => { image_list.push(v); });    
    }
}

function addDatum(img_src, imw, imh) {
    let tbody = document.getElementById('object-table-body');
    let row = document.createElement('tr');
    row.align = "center";
    for(i = 0; i < 3 ; i++) {
        let datum = document.createElement('td');
        datum.innerText = arguments[i];
        datum.className = 'object-table-data';
        datum.align = "center";
        row.appendChild(datum);
    }
    
    let imgdatum = document.createElement('td');
    
    let a = document.createElement('a');
    a.target = "_blank";
    a.href = "img/" + img_src;
    let imge = document.createElement("img");
    imge.src = "img/" + img_src;
    imge.className = "rounded mx-auto d-block";
    imge.style = "width:35%; height:35%;";
    a.appendChild(imge);

    let rm = document.createElement('input');
    rm.type = "button";
    rm.value = "Remove";
    rm.setAttribute('onclick', 'deleteTableRow(this)');

    imgdatum.appendChild(a);
    imgdatum.appendChild(rm);
    row.appendChild(imgdatum);
    tbody.appendChild(row); 
}

function deleteTableRow(elmnt) {
    // remove from table and carousel...
    let p = elmnt.parentNode.parentNode;
    p.parentNode.removeChild(p);
    img_name = p.firstChild.innerText;
    // alert(img_name);
    removefromcarousel(img_name);

    // call DELETE on google DataStore...
    let newObj = { 'name': img_name, };
    fetch(cloud_function, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newObj),
    });
}


//===== image drawing =====//
// canvas variables
let ls = window.sessionStorage,
    photo = document.getElementById('uploadImage'),
    canvas = document.getElementById('canvas'),
    // caption = document.getElementById('caption'),
    // colors = document.getElementsByName('color'),
    context = canvas.getContext('2d'),
    fileReader = new FileReader(), current_file = null,
    img = new Image(), lastImgData = ls.getItem('image'), 
    x, y, 
    currentText = ls.getItem('text') || "",
    color = ls.getItem('color') || "black", 
    neww = 0, newh = 0,
    phsubmit = document.getElementById('photosubmit');

// if (color) {
//     Array.prototype.forEach.call(colors, function(el) {
//         if (el.value === color) {
//              el.checked = true;   
//         }
//     });
// }

// if (currentText) {
//     caption.value = currentText;   
// }

if (lastImgData) {
    img.src = lastImgData;   
}

fileReader.onload = function (e) {
    console.log(typeof e.target.result, e.target.result instanceof Blob);
    img.src = e.target.result;
};

img.onload = function() {
    let rw = img.width / canvas.width; // width and height are maximum thumbnail's bounds
    let rh = img.height / canvas.height;
    
    if (rw > rh)
    {
        newh = Math.round(img.height / rw);
        neww = canvas.width;
    }
    else
    {
        neww = Math.round(img.width / rh);
        newh = canvas.height;
    }
    
    x = (canvas.width - neww) / 2,
    y = (canvas.height - newh) / 2;
    
    drawImage();
};

photo.addEventListener('change', function() {
    let file = this.files[0];
    current_file = file.name;
    return file && fileReader.readAsDataURL(file); 
}); 

// caption.addEventListener('change', function(event) {
//     currentText = event.target.value;
//     drawImage();
// });

canvas.addEventListener('dragover', function(event) {
    event.preventDefault(); 
});

canvas.addEventListener('drop', function(event) {
    event.preventDefault();
    fileReader.readAsDataURL(event.dataTransfer.files[0]);
});

// Array.prototype.forEach.call(colors, function(el) {
//     el.addEventListener('change', function(e) {
//         color = e.target.value;
//         drawImage(currentText);
//     });
// });

function drawImage() {
    let dataUrl;
    canvas.width = canvas.width;

    if (img.width) context.drawImage(img, x, y, neww, newh);

    context.font = 'bold 18pt arial';
    context.fillStyle = color;
    context.fillText(currentText, 150, 100);

    dataUrl = canvas.toDataURL();

    // document.getElementById('imageData').href = dataUrl;
    // document.getElementById('preview').src = dataUrl;

    // ls.setItem('text', currentText);
    // ls.setItem('color', color);
    ls.setItem('image', img.src);
}


//===== image uploading =====//
function upload() {
    if (current_file == null) return false;
    if (!searchimglist()) {
        // upload to server "/img"...
        let newObj1 = {
            'filename': current_file,
            'blob': fileReader.result,
        };
        fetch(image_server, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newObj1),
        }).then( (response) => {
            // add to carousel...
            addtocarousel(current_file, img.width, img.height);
        });

        // add to DataStore...
        let newObj2 = {
            'name': current_file,
            'width': img.width,
            'height': img.height,
        };
        fetch(cloud_function, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newObj2),
        }).then( (response) => {
            // add to metadata table...
            addDatum(current_file, img.width, img.height);
        });

        // add to image_list...
        image_list.push(newObj2);
        alert("Finished Uploading.")
    } else {
        alert("Image name is already in use.");
    }
    return false;
}

function addtocarousel(img_src, imw, imh) {
    let newdiv = document.createElement('div');
    newdiv.id = "carousel-" + img_src;
    newdiv.className = "carousel-item";
    let newimg = document.createElement('img');
    newimg.src = "img/" + img_src;
    newimg.className = "rounded mx-auto d-block";
    newimg.alt = "";
    if (imw > 1000 || imh > 500) {
        asprat = imh > imw ? (500./imh) : (800./imw);
        newimg.width = Math.round(imw*asprat);
        newimg.height = Math.round(imh*asprat);
    }
    newdiv.appendChild(newimg);
    let carouseldiv = document.getElementById('carouselrounds');
    carouseldiv.appendChild(newdiv);
}

function removefromcarousel(img_src) {
    let target = document.getElementById("carousel-"+img_src);
    if (target.className = "carousel-item active" && target.nextSibling != null) {
        target.nextSibling.className = "carousel-item active";
        target.parentNode.removeChild(target);
    } else if (target.className = "carousel-item active" && target.previousSibling != null) {
        target.previousSibling.className = "carousel-item active";
        target.parentNode.removeChild(target);
    }
}

function searchimglist() {
    for (i=0; i < image_list.length; i++) {
        if ( image_list[i]['name'] == current_file )
            return true;
    }
    return false;
}


//===== main execution =====//
// get meta data and append everything to carousel...
getmetadata().then( (response) => {
    image_list.forEach(function(e) {
        addtocarousel(e['name'], e['width'], e['height']);
        addDatum(e['name'], e['width'], e['height']);
    });
});
drawImage();