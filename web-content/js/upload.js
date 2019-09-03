//  http://tech.pro/tutorial/1383/javascript-one-language-to-rule-them-all

// cloud function and local image server
let cloud_function = "https://us-central1-revgcp-project1-trial.cloudfunctions.net/data_broker";
// let image_server = "http://localhost:5000/imageserve";
let image_server = cloud_function;
// let storepref = "img/";
let storepref = "https://storage.cloud.google.com/antarcticbucketfish66/web-content/img/";

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
    a.href = storepref + img_src;
    let imge = document.createElement("img");
    imge.src = storepref + img_src;
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
    elmnt.style.cursor = "wait";
    document.body.classList.add('busy-cursor');
    let p = elmnt.parentNode.parentNode;
    img_name = p.firstChild.innerText;
    // alert(img_name);

    // call DELETE on imageserver...
    let newObj = { 'name': img_name, };
    fetch(image_server, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newObj),
    }).then( (response) => {
        // remove from carousel, table, and image list
        removefromcarousel(img_name);
        elmnt.style.cursor="default";
        p.parentNode.removeChild(p);
        index = searchimglist(img_name);
        if (index > -1) image_list.splice(index,1);
        
        document.body.classList.remove('busy-cursor');
        // alert("Image Removed.")
    });
    // // call DELETE on google DataStore...
    // fetch(cloud_function, {
    //     method: 'DELETE',
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(newObj),
    // });
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
    img = new Image(), // lastImgData = ls.getItem('image'), 
    x, y, 
    currentText = ls.getItem('text') || "",
    color = ls.getItem('color') || "black", 
    neww = 0, newh = 0,
    phsubmit = document.getElementById('photosubmit');
    phbutton = document.getElementById('photobutton');

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

// if (lastImgData) {
//     img.src = lastImgData;   
// }

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
    if (!current_file) phbutton.disabled = true;
    else phbutton.disabled = false;
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


//===== linked-list =====//
// node class 
class Node { 
    constructor(element) 
    { 
        this.item = element; 
        this.next = null;
        this.prev = null;
    } 
} 

// linkedlist class 
class CarouselLinkedList { 
    constructor() 
    { 
        this.first = null;
        this.last = null;
    } 

    add(node) {
        if (!this.first) {
            this.first = node;
            this.last = node;
        } else {
            this.last.next = node;
            this.first.prev = node;
        }
        node.prev = this.last;
        node.next = this.first; 
        this.last = node;
        // alert("add");
    } 

    get(element) {
        let node = this.first;
        while (node) {
            if (element.id == node.item.id) {
                // alert("get");
                return node;
            }
            node = node.next;
        }
        // alert("get null");
        return null;
    }

    remove(element) {
        node = this.get(element);
        if (node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
            if (node == this.first) this.first = node.next;
            if (node == this.last) this.last = node.prev;
        }
        // alert("remove");
    }

    removeNode(node) {
        if (node) {
            // alert(node.prev);
            node.prev.next = node.next;
            // alert(node.next);
            node.next.prev = node.prev;
            if (node == this.first) this.first = node.next;
            if (node == this.last) this.last = node.prev;
        }
    }
} 


//===== image uploading =====//
// carousel variables
let carouselrounds = document.getElementById('carouselrounds');
let carx1 = document.getElementById('carousel-x1'),
    carx2 = document.getElementById('carousel-x2'),
    carx3 = document.getElementById('carousel-x3');
let carousel_list = new CarouselLinkedList();
let nodex1 = new Node(carx1),
    nodex2 = new Node(carx2),
    nodex3 = new Node(carx3);
carousel_list.add(nodex1);
carousel_list.add(nodex2);
carousel_list.add(nodex3);

function upload() {
    if (current_file == null) return false;
    if (searchimglist(current_file) < 0) {
        phbutton.style.cursor="wait";
        document.body.classList.add('busy-cursor');
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
                // add to image_list...
                image_list.push(newObj2);
                document.body.classList.remove('busy-cursor');
                phbutton.style.cursor="default";
                alert("Finished Uploading.")
            });
        });
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
    newimg.src = storepref + img_src;
    newimg.className = "rounded mx-auto d-block";
    newimg.alt = "";
    if (imw > 800 || imh > 500) {
        let asprat = Math.min((500./imh),(800./imw));
        newimg.width = Math.round(imw*asprat);
        newimg.height = Math.round(imh*asprat);
    }
    newdiv.appendChild(newimg);
    carnode = new Node(newdiv);
    carousel_list.add(carnode);
    carouselrounds.appendChild(newdiv);
}

function removefromcarousel(img_src) {
    let target = document.getElementById("carousel-" + img_src);
    let targetnode = carousel_list.get(target);
    // alert("carousel-" + img_src);
    // alert(targetnode.item.id);
    // alert(targetnode.prev.item.id);
    // alert(targetnode.next.item.id);
    if (target.className == "carousel-item active") {
        // alert("first faultline");
        targetnode.next.item.className = "carousel-item active";
        targetnode.next.next.item.className = "carousel-item";
    } else if (target.className == "carousel-item active carousel-item-left") {
        // alert("second faultline"); 
    } else if (target.className == "carousel-item carousel-item-next carousel-item-left") {
        // alert("third faultline");
        targetnode.prev.item.className = "carousel-item active";
        targetnode.next.item.className = "carousel-item";
    }
    carousel_list.removeNode(targetnode);
    target.parentNode.removeChild(target);
}

function searchimglist(img_name) {
    for (i=0; i < image_list.length; i++) {
        if ( image_list[i]['name'] == img_name )
            return i;
    }
    return -1;
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
