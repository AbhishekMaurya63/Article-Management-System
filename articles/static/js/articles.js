document.getElementById("next-btn").addEventListener("click", function () {
    const title = document.getElementById("title");
    const subtitle=document.getElementById('subtitle');
    const content=document.getElementById('editor-container');
    const author_name=document.getElementById('author_name');
    const email = document.getElementById("email");
    isValid=true
    if(!validateTitle()){
        title.focus()
        title.style.border='1px solid red'
    
    }else if(!validateSubtitle()){
        subtitle.focus()
        subtitle.style.border='1px solid red'
    }else if(!validateContent()){
        // content.focus()
        content.style.border='1px solid red'
    }
    else if(!validateAuthorName()){
        author_name.focus()
        author_name.style.border='1px solid red'
    }else if(!validateEmail()){
        email.focus()
        email.style.border='1px solid red'
    }
    else{
        document.getElementById("form-page-1").style.display = "none";
        document.getElementById("form-page-2").style.display = "block";
    }
});
let uploadedImages = []; // Array to store image data and captions

function openimagemodal() {
    const modal = new bootstrap.Modal(document.getElementById('addImagesModal'));
    modal.show();
}

function triggerImageUpload() {
    document.getElementById("hiddenFileInput").click();
}

function handleImageUpload(input) {
    const file = input.files[0];
    const validExtensions = [
        "image/jpeg",  
        "image/png",   
        "image/gif",   
        "image/jpg",   
        "image/bmp",   
        "image/tiff",  
        "image/webp", 
        "image/heif",  
        "image/ico", 
        "image/psd",
        "image/avif"
      ];
      

    // Validation
    if (file && validExtensions.includes(file.type)) {
        const imageIndex = uploadedImages.length; // Get the current index for the image
        uploadedImages.push({ file, caption: "" });

        // Preview Image
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageWrapper = document.createElement("div");
            imageWrapper.className = "image-preview-wrapper position-relative";
            imageWrapper.style.width = "120px";
            imageWrapper.style.margin = "10px";

            // Image Preview
            const imagePreview = document.createElement("div");
            imagePreview.style.width = "100%";
            imagePreview.style.height = "100px";
            imagePreview.style.backgroundImage = `url(${e.target.result})`;
            imagePreview.style.backgroundSize = "cover";
            imagePreview.style.backgroundPosition = "center";
            imagePreview.style.border = "1px solid #ddd";
            imagePreview.style.borderRadius = "5px";

            // Caption Input
            const captionInput = document.createElement("input");
            captionInput.type = "text";
            captionInput.className = "form-control mt-2 captions";
            captionInput.placeholder = "Enter caption";
            captionInput.dataset.index = imageIndex; // Associate input with the correct image index
            captionInput.oninput = function () {
                const index = parseInt(this.dataset.index, 10); // Use dataset index
                uploadedImages[index].caption = this.value;
                document.getElementById("saveImages").disabled = false;
                    document.getElementById("saveImages").innerText = "Save Changes";
            };

            // Delete Button
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger btn-sm position-absolute";
            deleteButton.style.top = "5px";
            deleteButton.style.right = "5px";
            deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
            deleteButton.onclick = function () {
                const index = parseInt(captionInput.dataset.index, 10);
                uploadedImages.splice(index, 1);
                imageWrapper.remove();

                // Reassign dataset indices after deletion
                const allInputs = document.querySelectorAll(".image-preview-wrapper input");
                allInputs.forEach((input, idx) => {
                    input.dataset.index = idx;
                });

                // Re-enable Save Button if images exist
                if (uploadedImages.length > 0) {
                    document.getElementById("saveImages").disabled = false;
                    document.getElementById("saveImages").innerText = "Save Changes";
                }
            };

            imageWrapper.appendChild(imagePreview);
            imageWrapper.appendChild(captionInput);
            imageWrapper.appendChild(deleteButton);
            document.getElementById("imageContainer").insertBefore(imageWrapper, document.getElementById("addImageButton"));
        };
        reader.readAsDataURL(file);

        // Reset Input
        input.value = "";
        document.getElementById("imageError").textContent = "";

        // Enable Save Button
        document.getElementById("saveImages").disabled = false;
        document.getElementById("saveImages").innerText = "Save Changes";
    } else {
        document.getElementById("imageError").textContent = "Invalid file type. Please upload an image.";
    }
}

document.getElementById("saveImages").addEventListener("click", () => {
    if (uploadedImages.length === 0) {
        alert("Please upload at least one image.");
    } else {
        // alert("Images saved successfully!");
        console.log("Uploaded Images:", uploadedImages); // Send this to your backend or process it as needed

        // Disable Save Button and Update Text
        document.getElementById("saveImages").innerText = "Saved Images";
        document.getElementById("saveImages").disabled = true;

        // Close the Modal
        const modal = document.getElementById("addImagesModal");
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
    }
});

function openmapmodal() {
    const modal = new bootstrap.Modal(document.getElementById('locationModal'));
    modal.show();
}
let updatedlocation = [];

document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('mapContainer').setView([51.505, -0.09], 13);

    // OpenStreetMap base layer
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
    });

    // Mapbox satellite layer
    const satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN', {
        attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
        tileSize: 512,
        zoomOffset: -1
    });

    // Add OpenStreetMap as the default layer
    osmLayer.addTo(map);

    const marker = L.marker([51.505, -0.09], { draggable: true }).addTo(map);

    const modalElement = document.getElementById('locationModal');
    modalElement.addEventListener('shown.bs.modal', function () {
        setTimeout(() => {
            map.invalidateSize(); // Force Leaflet to recalculate dimensions
        }, 100); // Optional: Add a small delay
    });

    // Toggle between OpenStreetMap and satellite layer
    const layerControl = L.control.layers({
        "OpenStreetMap": osmLayer,
        "Satellite": satelliteLayer
    }).addTo(map);

    // Search by location (village, street, postal code, etc.)
    document.getElementById('locationSearch').addEventListener('input', async function (e) {
        const query = e.target.value;
        if (query.length > 2) {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1`);
            const results = await response.json();
            console.log(results)
            if (results.length > 0) {
                const { lat, lon, address } = results[0];
                map.setView([lat, lon], 13);
                marker.setLatLng([lat, lon]);
                updateLatLngInputs(lat, lon);
                fetchAddress(lat, lon); // Fetch and display the address (city, state, country, street, postal code, etc.)
            }
        }
    });

    // Search by latitude and longitude
    document.getElementById('latitudeInput').addEventListener('change', updateMapByLatLng);
    document.getElementById('longitudeInput').addEventListener('change', updateMapByLatLng);

    function updateMapByLatLng() {
        const lat = parseFloat(document.getElementById('latitudeInput').value);
        const lon = parseFloat(document.getElementById('longitudeInput').value);
        if (!isNaN(lat) && !isNaN(lon)) {
            map.setView([lat, lon], 13);
            marker.setLatLng([lat, lon]);
            fetchAddress(lat, lon); // Fetch and display the address (city, state, country)
        }
    }

    // Update latitude and longitude inputs when the marker is moved
    marker.on('moveend', function (e) {
        const { lat, lng } = e.target.getLatLng();
        updateLatLngInputs(lat, lng);
        fetchAddress(lat, lng); // Fetch and display the address (city, state, country, street, postal code, etc.)
    });

    // Confirm and log selected location
    document.getElementById('confirmLocation').addEventListener('click', function () {
        const { lat, lng } = marker.getLatLng();
        console.log(updatedlocation);
        const modal = document.getElementById("locationModal");
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
    });

    function updateLatLngInputs(lat, lon) {
        document.getElementById('latitudeInput').value = lat.toFixed(6);
        document.getElementById('longitudeInput').value = lon.toFixed(6);
    }

    // Fetch address using Reverse Geocoding
    async function fetchAddress(lat, lon) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`);
        const data = await response.json();
        const address = data.address || {};
        console.log(address)

        // Extract the components (village, street, postal code, etc.)
        const village = address.village || 'Unknown Village';
        const street = address.road || 'Unknown Street';
        const postalCode = address.postcode || 'Unknown Postal Code';
        const city = address.city || address.city_district || address.suburb || 'Unknown City';
        const state = address.state || 'Unknown State';
        const country = address.country || 'Unknown Country';

        // Update the location search field
        document.getElementById('locationSearch').value = `${village}, ${street}, ${postalCode}, ${city}, ${state}, ${country}`;

        // Store detailed location data
        updatedlocation = [{
            latitude: lat.toFixed(20),
            longitude: lon.toFixed(20),
            city,
            state,
            country
        }];
    }

    // Add click event to map to select location
    map.on('click', function (e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        marker.setLatLng([lat, lon]); // Move the marker to the clicked location
        updateLatLngInputs(lat, lon); // Update the input fields with the new coordinates
        fetchAddress(lat, lon); // Fetch and display the address (village, street, postal code, etc.)
    });
});


document.addEventListener("DOMContentLoaded", function() {
    // const modal = new bootstrap.Modal(document.getElementById('locationModal'));
    // modal.show();
    // script for tag 
let tagsArray = [];  // This will store the tags added by the user

// Function to create tag elements
const createTagElement = (tag) => {
    const tagElement = document.createElement('div');
    tagElement.classList.add('tag');
    tagElement.innerText = tag;

    const cutButton = document.createElement('button');
    cutButton.innerText = '×';  // The cut button for removing a tag
    cutButton.classList.add('cut-btn');
    cutButton.onclick = () => removeTag(tag);  // Remove tag when clicked

    tagElement.appendChild(cutButton);
    document.getElementById('tags-list').appendChild(tagElement);
};

// Function to add a tag
const addTag = (tag) => {
    // Add tag if not already in the list and it is not empty
    if (tag && !tagsArray.includes(tag)) {
        tagsArray.push(tag);
        createTagElement(tag);  // Create and display the tag
        document.getElementById('tags-input').value = '';  // Clear input field
        document.getElementById('tags-suggestions').innerHTML = '';  // Clear suggestions
    }
};

// Function to remove a tag
const removeTag = (tag) => {
    const index = tagsArray.indexOf(tag);
    if (index > -1) {
        tagsArray.splice(index, 1);  // Remove tag from the array
        const tagElements = document.querySelectorAll('.tag');
        tagElements.forEach((el) => {
            if (el.innerText.replace('×', '') === tag) {
                el.remove();  // Remove the tag from the DOM
            }
        });
    }
};

// Function to validate tags
const validateTags = () => {
    if (tagsArray.length === 0) {
        document.getElementById('tags-error').innerText = 'Please add at least one tag.';
        return false;
    } else {
        document.getElementById('tags-input').style.border='1px solid var(--border-color)';
        document.getElementById('tags-error').innerText = '';  // Clear error message if valid
        return true;
    }
};

// Function to filter predefined tags based on user input
const showSuggestions = (inputValue) => {
    const predefinedTags = ["Politics", "Sports", "Tech", "Business", "Health", "Entertainment", "Travel", "Science", "Education", "Environment"];
    const suggestions = predefinedTags.filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()));

    const suggestionsContainer = document.getElementById('tags-suggestions');
    suggestionsContainer.innerHTML = '';  // Clear previous suggestions

    if (inputValue !== '') {
        suggestions.forEach(tag => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion');
            suggestionElement.innerText = tag;
            suggestionElement.onclick = () => addTag(tag);  // Add tag when clicked
            suggestionsContainer.appendChild(suggestionElement);
        });
    }
};

// Add event listeners to predefined tags (instead of inline HTML)
document.querySelectorAll('.predefined-tag').forEach(tagElement => {
    tagElement.addEventListener('click', () => {
        const tag = tagElement.innerText.trim();
        tagElement.style.display='none';
        addTag(tag);
    });
});

// Event listener for the tag input field
document.getElementById('tags-input').addEventListener('input', (e) => {
    const inputValue = e.target.value.trim();
    showSuggestions(inputValue);  // Show suggestions as user types
});

// Event listener to add tag when pressing Enter or Comma
document.getElementById('tags-input').addEventListener('keydown', (e) => {
    const tagInput = document.getElementById('tags-input').value.trim();

    if ((e.key === 'Enter' || e.key === ',') && tagInput !== '') {
        e.preventDefault();  // Prevent form submission on Enter
        addTag(tagInput);  // Add the tag
    }
});



    // Add event listeners for real-time validation
    document.getElementById('title').addEventListener('input', validateTitle);
    document.getElementById('subtitle').addEventListener('input', validateSubtitle);
    document.getElementById('author_name').addEventListener('input', validateAuthorName);
    document.getElementById('email').addEventListener('input', validateEmail);
    document.getElementById('image').addEventListener('change', validateImage);
    document.getElementById('category').addEventListener('change',()=>{
         category.style.border='1px solid var(--border-color)'
    });
    document.getElementById('publish_date').addEventListener('change', validatePublishDate);
    document.getElementById('agree_to_terms').addEventListener('change', validateAgreeToTerms);
    document.getElementById('tags-input').addEventListener('input',validateTags)


    document.getElementById('prev-btn').addEventListener('click', function() {
        document.getElementById('form-page-1').style.display = 'block';
        document.getElementById('form-page-2').style.display = 'none';
    });

   
    // Form submission validation
    document.getElementById('submit-btn').addEventListener('click', function() {
        const imageInput = document.getElementById('image');
        const tagsInput = document.getElementById('tags-input');
        const categoryInput = document.getElementById('category');
        const publishDateInput = document.getElementById('publish_date');
        const agreeToTermsCheckbox = document.getElementById('agree_to_terms');
        const token = localStorage.getItem("token");
        const data = JSON.parse(localStorage.getItem("user"));
        
        // Validate inputs (use your existing validation functions)
        let isValid = true;
        if (!validateImage()) {
            imageInput.focus();
            imageInput.style.border = '1px solid red';
            isValid = false;
        } else if (!validateTags()) {
            tagsInput.focus();
            tagsInput.style.border = '1px solid red';
            isValid = false;
        } else if (categoryInput.value === '') {
            categoryInput.focus();
            categoryInput.style.border = '1px solid red';
            isValid = false;
        } else if (!validatePublishDate()) {
            publishDateInput.focus();
            publishDateInput.style.border = '1px solid red';
            isValid = false;
        } else if (!agreeToTermsCheckbox.checked) {
            document.getElementById('form-err').innerText = 'You must agree to the terms and conditions.';
            isValid = false;
        }
    
        if (isValid) {      
            const submitButton = document.getElementById('submit-btn');
            const loader = document.getElementById('loader');
            loader.style.display = 'inline-block';
            submitButton.disabled = true;
        
            const formData = new FormData();
            formData.append('title', document.getElementById('title').value);
            formData.append('subtitle', document.getElementById('subtitle').value);
            formData.append('content', tinymce.get('editor-container').getContent());
 // Assuming Quill for rich text editor
            formData.append('author_name', document.getElementById('author_name').value);
            formData.append('author', data.id); // Assuming you're getting the user's ID from localStorage
            formData.append('email', document.getElementById('email').value);
            formData.append('image', document.getElementById('image').files[0]); // Image file
            formData.append('tags', tagsArray.join(',')); // Comma-separated tags
            formData.append('category', document.getElementById('category').value);
            formData.append('publish_date', document.getElementById('publish_date').value);
            formData.append('agreed_to_terms', agreeToTermsCheckbox.checked ? "1" : "0");
        
            if (updatedlocation.length > 0) {
                formData.append('country', updatedlocation[0].country);
                formData.append('state', updatedlocation[0].state);
                formData.append('city', updatedlocation[0].city);
                formData.append('latitude', updatedlocation[0].latitude);
                formData.append('longitude', updatedlocation[0].longitude);
                console.log(updatedlocation[0].state);
            }
        
            // Send the FormData fetch
            fetch('/api/articles/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Add your token
                },
                body: formData // Use FormData as the request body
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        console.error('Error:', error); // Log detailed error
                        throw new Error(`HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data && data.id) {
                    document.getElementById('seeArticleBtn').href = `/articles/articles/${data.id}/`;
                    uploadImages(data.id, token);
                    document.getElementById('page1').reset();
                    document.getElementById('page2').reset();
                    const modal = new bootstrap.Modal(document.getElementById('submissionSuccessModal'));
                    modal.show();
                } else {
                    alert('Error submitting article: ' + JSON.stringify(data));
                }
            })
            .catch(error => {
                // console.error('Error:', error);
                console.error('Fetch error:', error);
                alert('An error occurred while submitting the article.');
            })
            .finally(() => {
                // Hide loader and re-enable the submit button
                loader.style.display = 'none';
                submitButton.disabled = false;
            });
        }
         else {
            alert('Please fill in all fields correctly.');
        }
    });
});
async function uploadImages(userId,token) {
    const apiUrl = "/api/article-images/";
    
    if (uploadedImages.length === 0) {
        return;
    }

    for (const image of uploadedImages) {
        const formData = new FormData();
        formData.append("image", image.file); // Add the image file
        formData.append("caption", image.caption); // Add the image file
        formData.append("article", userId); // Add the user ID

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`, // Add your token
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Image uploaded successfully:", result);
            } else {
                console.error("Error uploading image:", await response.text());
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }
    return
}

// for content  

// Initialize TinyMCE editor
tinymce.init({
    selector: '#editor-container',
    plugins: 'lists link image code wordcount textcolor colorpicker textpattern',
    toolbar: 'undo redo | blocks | bold italic underline | align | bullist numlist outdent indent | link image | forecolor backcolor | fontselect fontsizeselect | code',
    placeholder: 'Write your article content here...',
    setup: function (editor) {
        editor.on('input', function () {
            updateWordCount(editor);
        });
    }
});

// Count words in the editor
const countWords = (text) => {
    let words = text.trim().split(/\s+/);
    return words.length;
};
const countCharacters = (text) => {
    return text.length; // Count the length of the trimmed text, including spaces
};
const updateWordCount = (editor) => {
    const content = editor.getContent({ format: 'text' }).trim(); // Get plain text content
    const wordCount = countWords(content);
    const characterCount = countCharacters(content);

    document.getElementById('word-count').innerText = `Words: ${wordCount} || Characters: ${characterCount}`;
};

// You can add a simple validation before submitting the form
const validateContent = () => {
    const content = tinymce.get('editor-container').getContent({ format: 'text' }).trim();
    if (content === '') {
        document.getElementById('content-error').innerText = 'Content cannot be empty';
        return false;
    } else if (countCharacters(content) < 20) {
        document.getElementById('content-error').innerText = 'It must be at least 10 characters';
        return false;
    }
    return true;
};

document.addEventListener("DOMContentLoaded", function() {
    const publishDateInput = document.getElementById("publish_date");

    // Initialize Flatpickr with future date restrictions
    flatpickr(publishDateInput, {
        minDate:  new Date().fp_incr(1),  // Only allow future dates
        dateFormat: "Y-m-d",  // Format the date
        locale: "en",  // Locale for language (optional)
        theme: "light",  // Flatpickr theme, you can also use "dark" if desired
        disableMobile: true,  // Disable mobile version of the picker for better UX
        placeholder: "Select a future date",
        onChange: function(selectedDates, dateStr, instance) {
            // Optionally, you can handle the date change here
            console.log("Selected date: ", dateStr);
        }
    });
});


// validations 

// Validation functions
const validateTitle = () => {
    const title = document.getElementById('title').value;
    document.getElementById('title-error').innerText=''
    document.getElementById('title').style.border='1px solid var(--border-color)'
    // Check if title starts with space
    if (title.trim().length === 0) {
        document.getElementById('title-error').innerText = "Title cannot be empty or start with spaces.";
        return false;
    }

    // Check for title length (must be at least 10 characters)
    if (title.length < 10) {
        document.getElementById('title-error').innerText = "Title must be at least 10 characters long.";
        return false;
    }

    // Check if title contains special characters
    const specialCharsPattern = /[!@#$%^"{}<>]/g; // List of special characters
    if (specialCharsPattern.test(title)) {
        document.getElementById('title-error').innerText = "Title cannot contain special characters.";
        return false;
    }

    // If all checks pass, clear the error message
    document.getElementById('title-error').innerText = '';
    return true;
};

const validateSubtitle = () => {
    const subtitle = document.getElementById('subtitle').value;
    document.getElementById('subtitle-error').innerText=''
    document.getElementById('subtitle').style.border='1px solid var(--border-color)'
    // If subtitle is filled, apply validation
    if (subtitle) {
        // Check if subtitle starts with space
        if (subtitle.trim().length === 0) {
            document.getElementById('subtitle-error').innerText = "Subtitle cannot start with spaces.";
            return false;
        }

        // Check for subtitle length (must be at least 10 characters)
        if (subtitle.length < 10) {
            document.getElementById('subtitle-error').innerText = "Subtitle must be at least 10 characters long.";
            return false;
        }

        // Check if subtitle contains special characters
        const specialCharsPattern = /[!@#$%^"{}<>]/g; // List of special characters
        if (specialCharsPattern.test(subtitle)) {
            document.getElementById('subtitle-error').innerText = "Subtitle cannot contain special characters.";
            return false;
        }
    } else {
        // If subtitle is not provided, no validation needed, so clear any error message
        document.getElementById('subtitle-error').innerText = '';
        return true;
    }

    // If all checks pass, clear the error message
    document.getElementById('subtitle-error').innerText = '';
    return true;
};

const validateAuthorName = () => {
    document.getElementById('author-error').innerText=''
    document.getElementById('author_name').style.border='1px solid var(--border-color)'
    const authorName = document.getElementById('author_name').value;
    const authorNameError = document.getElementById('author-error');
    const authorNameRegex = /^[A-Za-z\s]+(?: [A-Za-z]+)*$/; // Allows alphabetic characters and single spaces between words

    // Check if the author name starts with a space
    if (authorName.startsWith(' ')) {
        authorNameError.innerText = "Author name should not start with a space.";
        return false;
    }

    // Check if the author name contains numbers or special characters
    if (!authorNameRegex.test(authorName)) {
        authorNameError.innerText = "Author name can only contain letters and single spaces.";
        return false;
    }

    // Check if there are multiple spaces between words
    if (/\s{2,}/.test(authorName)) {
        authorNameError.innerText = "Author name cannot have multiple spaces between words.";
        return false;
    }

    // If all validations pass, clear error message
    authorNameError.innerText = "";
    return true;
};

// Adding event listener for live validation (optional)





const validateEmail = () => {
    document.getElementById('email-error').innerText=''
    document.getElementById('email').style.border='1px solid var(--border-color)'
    const email = document.getElementById('email').value;
    const emailPattern = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/;
    const emailErrorElement = document.getElementById('email-error');
    
    // Clear previous errors
    emailErrorElement.innerText = '';
    
    // Check if the email starts with spaces
    if (email.startsWith(' ')) {
        emailErrorElement.innerText = "Email cannot start with a space.";
        return false;
    }

    // Check if the email matches the pattern
    if (!emailPattern.test(email)) {
        // Check if email contains invalid characters
        if (/[^a-zA-Z0-9._@-]/.test(email)) {
            emailErrorElement.innerText = "Email contains invalid characters. Only letters, numbers, ._- are allowed.";
        }
        // Check if email domain or subdomain is missing or invalid
        else if (!email.includes('@') || !email.includes('.')) {
            emailErrorElement.innerText = "Please enter a valid email address.";
        }
        else {
            emailErrorElement.innerText = "Please enter a valid email address.";
        }
        return false;
    }

    // Email is valid
    emailErrorElement.innerText = '';
    return true;
};


const validateImage = () => {
    document.getElementById('image-error').innerText=''
    document.getElementById('image').style.border='1px solid var(--border-color)'
    const image = document.getElementById('image').files[0]; // Get the first file (if any)
    const imageErrorElement = document.getElementById('image-error');
    
    // Clear previous errors
    imageErrorElement.innerText = '';

    if (!image) {
        imageErrorElement.innerText = "Please select an image.";
        return false;
    }
    // Check for valid file extension (jpg, jpeg, png)
    const validExtensions = ["image/jpeg",  
        "image/png",   
        "image/gif",   
        "image/jpg",   
        "image/bmp",   
        "image/tiff",  
        "image/webp", 
        "image/heif",  
        "image/ico", 
        "image/psd"];
    if (!validExtensions.includes(image.type)) {
        imageErrorElement.innerText = "Invalid file format.";
        return false;
    }

    // Check the image size (min 100KB, max 5MB)
    const minSize = 100 * 1024;  // 100KB in bytes
    const maxSize = 5 * 1024 * 1024;  // 5MB in bytes
    const imageSize = image.size;
    
    if (imageSize < minSize) {
        imageErrorElement.innerText = "Image size is too small. Minimum size is 100KB.";
        return false;
    }

    if (imageSize > maxSize) {
        imageErrorElement.innerText = "Image size is too large. Maximum size is 5MB.";
        return false;
    }

    // Image is valid
    imageErrorElement.innerText = '';
    return true;




};







const validatePublishDate = () => {
    document.getElementById('publish_date-error').innerText=''
    document.getElementById('publish_date').style.border='1px solid var(--border-color)'
    const publishDate = new Date(document.getElementById('publish_date').value);
    if (publishDate == '' ) {
        document.getElementById('publish_date-error').innerText = errorMessages.publish_date;
        return false;
    } else {
        document.getElementById('publish_date-error').innerText = '';
        return true;
    }
};

const validateAgreeToTerms = () => {
    document.getElementById('form-err').innerText=''
    const agreeToTerms = document.getElementById('agree_to_terms').checked;
    console.log(agreeToTerms)
    if (!agreeToTerms) {
        document.getElementById('form-err').innerText = errorMessages.agree_to_terms;
        return false;
    } else {
        document.getElementById('form-err').innerText = '';
        return true;
    }
};


