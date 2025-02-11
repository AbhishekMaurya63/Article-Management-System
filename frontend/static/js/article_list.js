function fetchArticles(page = 1, filters = {}) {
    const articlesContainer = document.getElementById('articles-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Show loading spinner
    loadingSpinner.style.display = 'block';
    articlesContainer.innerHTML = '';

    // Construct query parameters for filters
    let queryParams = `page=${page}`;
    if (filters.title) {
        queryParams += `&title=${encodeURIComponent(filters.title)}`;
    }
    if (filters.category) {
        queryParams += `&category=${encodeURIComponent(filters.category)}`;
    }
    if (filters.tags && Array.isArray(filters.tags)) {
        filters.tags.forEach(tag => {
            queryParams += `&tags=${encodeURIComponent(tag)}`;
        });   
    }
    if (filters.publish_date) {
        queryParams += `&publish_date=${encodeURIComponent(filters.publish_date)}`;
    }
    if (filters.country) {
        queryParams += `&country=${encodeURIComponent(filters.country)}`;
    }
    if (filters.state) {
        queryParams += `&state=${encodeURIComponent(filters.state)}`;
    }
    if (filters.city) {
        queryParams += `&city=${encodeURIComponent(filters.city)}`;
    }
    console.log(queryParams)
    // Fetch articles with filters and pagination
    fetch(`/api/published-articles/?${queryParams}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data.results)
            loadingSpinner.style.display = 'none';

            if (data && data.results) {
                // Save articles data to be filtered later
                window.articlesData = data.results;

                // Display articles
                articlesContainer.innerHTML = '';
                data.results.forEach(article => {
                    const articleCard = document.createElement('div');
                    articleCard.classList.add('col-md-4');
                    articleCard.classList.add('col-sm-6');
                    articleCard.classList.add('mb-5');
                    articleCard.innerHTML = `
                        <div class="card article-card" data-title="${article.title.toLowerCase()}" data-category="${article.category.toLowerCase()}">
                            <img src="${article.image}" alt="${article.title}" class="article-image">
                            <div class="card-body">
                                <h5 class="article-title">${article.title}</h5>
                                <p class="article-meta">
                                    <strong>Author:</strong> ${article.author_name} | 
                                    <strong>Category:</strong> ${article.category} | 
                                    <strong>Published on:</strong> ${new Date(article.publish_date).toLocaleDateString()}
                                </p>
                                <div class="article-content">
                                    ${article.subtitle}
                                </div>
                            </div>
                            <div class="article-footer">
                                <a href="/public_article/${article.id}/" class="btn btn-sm btn-primary">Read More</a>
                            </div>
                        </div>
                    `;
                    articlesContainer.appendChild(articleCard);
                });
                // console.log(data)
                renderPagination(data.total_pages, page);
            } else {
                articlesContainer.innerHTML = '<div class="col-12 text-center">No articles available.</div>';
            }
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            articlesContainer.innerHTML = '<div class="col-12 text-center text-danger">Error loading articles. Please try again later.</div>';
        });
}
function renderPagination(totalPages, currentPage) {
    const paginationNav = document.getElementById('pagination-nav');
    const paginationUl = document.getElementById('pagination');

    // Clear existing pagination buttons
    paginationUl.innerHTML = '';
    // console.log(totalPages,currentPage)
    // Helper function to create a pagination button
    function createPaginationButton(page, isActive = false) {
        const li = document.createElement('li');
        li.className = `page-item ${isActive ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-page="${page}">${page}</a>`;
        return li;
    }

    // Add "Previous" button
    if (currentPage > 1) {
        const prevLi = document.createElement('li');
        prevLi.className = 'page-item';
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>`;
        paginationUl.appendChild(prevLi);
    }

    // Add numbered page buttons
    for (let page = 1; page <= totalPages; page++) {
        const isActive = page === currentPage;
        const pageButton = createPaginationButton(page, isActive);
        paginationUl.appendChild(pageButton);
    }

    // Add "Next" button
    if (currentPage < totalPages) {
        const nextLi = document.createElement('li');
        nextLi.className = 'page-item';
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>`;
        paginationUl.appendChild(nextLi);
    }

    // Add event listeners to pagination buttons
    const paginationLinks = paginationUl.querySelectorAll('.page-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const page = parseInt(link.getAttribute('data-page'), 10);
            if (!isNaN(page)) {
                fetchArticles(page); // Fetch articles for the clicked page
            }
        });
    });
}

function applyFilters() {
    const title = document.getElementById('search-title').value.trim();
    const category = document.getElementById('filter-category').value;
    const tags = document.getElementById('search-tags').value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
    const publishDate = document.getElementById('search-date').value.trim();
    const country = document.getElementById('filter-country').value;
    const state = document.getElementById('filter-state').value;
    const city = document.getElementById('filter-city').value;
    const dropdown = document.getElementById('filter-dropdown');

    const filters = {};
    if (title) filters.title = title;
    if (category) filters.category = category;
    if (tags.length > 0) filters.tags = tags;
    if (publishDate) filters.publish_date = publishDate;
    if(country) filters.country=country;
    if(state) filters.state=state;
    if(city) filters.city=city;

    // Fetch articles with the filters
    console.log(filters)
    fetchArticles(1, filters);
}

document.getElementById('search-title').addEventListener('input',applyFilters)
document.getElementById('search-tags').addEventListener('input',applyFilters)
document.getElementById('search-date').addEventListener('change',applyFilters)
document.getElementById('filter-category').addEventListener('change',applyFilters)
document.getElementById('filter-btn').addEventListener('click', applyFilters);
document.getElementById('filter-country').addEventListener('input',()=>{
    applyFilters()
    country_id=document.getElementById('filter-country').value;
    fetchState(country_id)
    // fetchCity(country_id)
})
document.getElementById('filter-state').addEventListener('input',()=>{
    applyFilters()
    state_id=document.getElementById('filter-state').value;
    // fetchCountry(state_id)
    fetchCity(state_id)
})
document.getElementById('filter-city').addEventListener('input',()=>{
    applyFilters()
    city_id=document.getElementById('filter-city').value;
    // fetchCountry(city_id)
    // fetchState(city_id)
})
     // Fetch articles on page load
        document.addEventListener('DOMContentLoaded', () => fetchArticles());
    
        // window.onload = async function () {
        //     const token = localStorage.getItem("token");
        //     const data = JSON.parse(localStorage.getItem("user"));
        //     if (!token || !data){
        //         document.getElementById('dash').style.display='none';
        //         document.getElementById('dropdown').style.display='none';
        //         document.getElementById('login').style.display='flex';
        //     }else{
        //         document.getElementById('dropdown').style.display='flex';
        //         document.getElementById('login').style.display='none';
        //         document.getElementById('dash').style.display='flex';
        //         setTokenRefreshTimer();
        //     }
        //     document.getElementById("username").innerText = data.username;
        //     document.getElementById('userImg').src = data.profile.profile_picture ? data.profile.profile_picture : '{% static "images/default-profile.png" %}';
        
        
        // }
    
        // Logout functionality
        document.getElementById("logout-btn").addEventListener("click", function () {
            const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem('refresh_token');
        if (token) {
          fetch("/api/logout/", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ refresh: refreshToken })
          })
          .then(response => {
            if (response.ok) {
              // Clear localStorage and redirect on successful logout
              localStorage.removeItem("token");
              localStorage.removeItem('refresh');
              localStorage.removeItem("user");
              window.location.href = "/users/login"; // Redirect to login
            } else {
              response.json().then(data => {
                console.error("Logout failed:", data);
                alert("Failed to logout. Please try again.");
              });
            }
          })
          .catch(error => {
            console.error("Error during logout:", error);
            alert("An error occurred during logout.");
          });
        } else {
          // If no token is found, simply redirect to login
          window.location.href = "/users/login";
        }
      });
document.addEventListener("DOMContentLoaded", function() {
    const publishDateInput = document.getElementById("search-date");

    // Initialize Flatpickr with future date restrictions
    // flatpickr(publishDateInput, {
    //     maxDate: 'today',  // Only allow past dates
    //     dateFormat: "Y-m-d",  // Format the date
    //     locale: "en",  // Locale for language (optional)
    //     theme: "light",  // Flatpickr theme, you can also use "dark" if desired
    //     disableMobile: true,  // Disable mobile version of the picker for better UX
    //     placeholder: "Select a future date",
    //     onChange: function(selectedDates, dateStr, instance) {
    //         // Optionally, you can handle the date change here
    //         // console.log("Selected date: ", dateStr);
    //     }
    // });
});


 // Toggle the dropdown visibility
document.getElementById('filter-dropdown-btn').addEventListener('click', function () {
    const dropdown = document.getElementById('filter-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Reset Filters Button
document.getElementById('clear-btn').addEventListener('click', function () {
    document.getElementById('search-title').value = '';
    document.getElementById('search-tags').value = '';
    document.getElementById('search-date').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-country').value = '';
    document.getElementById('filter-state').value = '';
    document.getElementById('filter-city').value = '';
    const dropdown = document.getElementById('filter-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'none';
    fetchArticles() 
    fetchCountry()
    // fetchState()
    // fetchCity()
});
document.getElementById('close-btn').addEventListener('click', function (){
    const dropdown = document.getElementById('filter-dropdown');
    dropdown.style.display = dropdown.style.display ='none';

})
async function fetchCountry(state_id='',city_id='') {
    fetch('/api/countries/')
    .then(response => response.json())
    .then(data => {
        console.log(data);

        const countryDropdown = document.getElementById('filter-country');

        // Ensure the dropdown is cleared before populating
        countryDropdown.innerHTML = '<option value="">Select Country</option>';

        // Populate the dropdown with countries
        data.results.forEach(country => {
            if(country.name!=='Unknown Country'){
            const option = document.createElement('option');
            option.value = country.id; // Use appropriate key for value
            option.textContent = country.name;
            countryDropdown.appendChild(option);
            }
        });
    })
    .catch(error => {
        console.error("Error during fetching:", error);
        alert("An error occurred while fetching countries.");
    });
}


async function fetchState(country_id='',city_id='') {
    fetch(`/api/states/?country=${country_id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        const stateDropdown = document.getElementById('filter-state');

        // Ensure the dropdown is cleared before populating
        stateDropdown.innerHTML = '<option value="">Select State</option>';

        // Populate the dropdown with countries
        data.results.forEach(state => {
            if(state.name!=='Unknown State'){
            const option = document.createElement('option');
            option.value = state.id; // Use appropriate key for value
            option.textContent = state.name;
            stateDropdown.appendChild(option);
            }
        });
    })
    .catch(error => {
        console.error("Error during fetching:", error);
        alert("An error occurred while fetching states.");
    });
}

async function fetchCity(state_id='') {
    fetch(`/api/cities/?state=${state_id}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        const cityDropdown = document.getElementById('filter-city');

        // Ensure the dropdown is cleared before populating
        cityDropdown.innerHTML = '<option value="">Select City</option>';

        // Populate the dropdown with countries
        data.results.forEach(city => {
            if(city.name!=='Unknown City'){
            const option = document.createElement('option');
            option.value = city.id; // Use appropriate key for value
            option.textContent = city.name;
            cityDropdown.appendChild(option);
            }
            
        });
    })
    .catch(error => {
        console.error("Error during fetching:", error);
        alert("An error occurred while fetching states.");
    });
}


document.addEventListener('DOMContentLoaded',()=>{
    fetchCountry()
    
})
