document.getElementById('userlogo').addEventListener('click',()=>{
    document.getElementById('userlogo').classList.toggle('animate')
})
function validate(event){
    event.preventDefault();
    userName=document.getElementById('userName').value;
    password=document.getElementById('password').value;
    const rememberMe = document.getElementById("rememberMe").checked;
    document.getElementById('usernameErr').innerText=''
    document.getElementById('passwordErr').innerText=''
        document.getElementById('userName').style.border='1px solid blueviolet'
        document.getElementById('inp').style.border='1px solid blueviolet'
    isValid=true
    if(userName==''){
        console
        document.getElementById('usernameErr').innerText='User Name Required'
        document.getElementById('userName').style.border='1px solid red'
        document.getElementById('userName').focus();
        isValid=false
    }
    else if(password==''){
        document.getElementById('passwordErr').innerText='Password Required'
        document.getElementById('inp').style.border='1px solid red'
        document.getElementById('password').focus();
        isValid=false
    }
    if(isValid){
        const submitButton = document.getElementById('submit-button');
        const loader = document.getElementById('loader');
        loader.style.display = 'inline-block';
        submitButton.disabled = true;
        const data={
            username:userName,
            password:password
        }

        fetch('/api/login/',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(data)
        })
        .then(response=>{
            const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Response not JSON");  // Handle HTML error page or other non-JSON response
                }
                return response.json(); 
        })
        .then(data=>{
            // console.log('Success',data)
            if(data.token){
                localStorage.setItem("token",data.token);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user',JSON.stringify(data.user))
                if (rememberMe) {
                    localStorage.setItem("username", userName);
                    localStorage.setItem("password", password);
                    localStorage.setItem("rememberMe", "true");
                } else {
                    sessionStorage.setItem("username", userName);
                    localStorage.removeItem("rememberMe"); // Remove remember flag
                }
                if(data.user.role!='User'){
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            }else{
                window.location.href = '/';
            }
            }else{
                document.getElementById('formErr').innerText='Invalid Username or Password'
            }
        })
        .catch((error)=>{
            console.log('Error','Login Failed',error)
        })
        .finally(() => {
            // Hide loader and re-enable the submit button
            loader.style.display = 'none';
            submitButton.disabled = false;
        });
    }
    return isValid;

}
document.getElementById('userName').addEventListener('input',()=>{
    document.getElementById('usernameErr').innerText=''
    document.getElementById('userName').style.border='1px solid blueviolet'
})
document.getElementById('password').addEventListener('input',()=>{
       document.getElementById('passwordErr').innerText=''
       document.getElementById('inp').style.border='1px solid blueviolet'
})
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
const togglePasswordVisibility = (id, button) => {
    const passwordField = document.getElementById(id);
    const icon = button.querySelector('i');
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye'); 
    icon.classList.toggle('fa-eye-slash'); 
};
const updatePasswordIcon = (id) => {
    const passwordField = document.getElementById(id);
    const icon = document.querySelector(`.toggle-password [data-password="${id}"]`);
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    if (passwordField.type === 'text') {
        icon.classList.toggle('fa-eye'); 
        icon.classList.toggle('fa-eye-slash'); 
    }
};
window.onload = function () {
    const rememberMe = localStorage.getItem("rememberMe");
    if (rememberMe === "true") {
        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");
        document.getElementById("userName").value = username;
        document.getElementById("password").value = password;
        document.getElementById("rememberMe").checked = true;
    }
};