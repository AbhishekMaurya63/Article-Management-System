document.getElementById('userlogo').addEventListener('click',()=>{
    document.getElementById('userlogo').classList.toggle('animate')
})
function validate(event){
    event.preventDefault();
    fname=document.getElementById('fname').value;
    lname=document.getElementById('lname').value;
    userName=document.getElementById('userName').value;
    email=document.getElementById('email').value;
    role=document.getElementById('role').value;
    password=document.getElementById('password').value;
    copassword=document.getElementById('copassword').value;
    checkbox = document.getElementById("agree");
    isValid=true
    if(!nameValidation(fname)){
        document.getElementById('fnameErr').innerText='Name Required'
        document.getElementById('fname').style.border='1px solid red'
        document.getElementById('fname').focus();
        isValid=false
    }
    else if(!usernameValidation(userName)){
        document.getElementById('usernameErr').innerText='User Name Required'
        document.getElementById('userName').style.border='1px solid red'
        document.getElementById('userName').focus();
        isValid=false
    }
    else if(!validateEmail(email)){
        document.getElementById('emailErr').innerText='Email Required'
        document.getElementById('email').style.border='1px solid red'
        document.getElementById('email').focus();
        isValid=false
    }
    else if(role==''){
        document.getElementById('roleErr').innerText='Select Role'
        document.getElementById('role').style.border='1px solid red'
        document.getElementById('role').focus();
        isValid=false
    }
    else if(!validatePassword(password)){
        document.getElementById('passwordErr').innerText='Password Required'
        document.getElementById('inp').style.border='1px solid red'
        document.getElementById('password').focus();
        isValid=false
    }
    else if(!validatePassword(copassword)){
        document.getElementById('copasswordErr').innerText='Password not matched!'
        document.getElementById('cinp').style.border='1px solid red'
        document.getElementById('copassword').focus();
        isValid=false
    }
    if (!checkbox.checked) {  // Prevent form submission
        document.getElementById("formErr").innerText = "You must agree to the terms and conditions.";
        checkbox.style.border = "1px solid red";  // Add a red border to the checkbox
        isValid=false
      } else {
        document.getElementById("formErr").innerText = "";  // Clear error message
        checkbox.style.border = "";  // Reset the border
      }
    if(isValid){
        const submitButton = document.getElementById('submit-button');
        const loader = document.getElementById('loader');
        loader.style.display = 'inline-block';
        submitButton.disabled = true;
        const data={
            first_name:fname,
            last_name:lname,
            username:userName,
            email:email,
            role:role,
            password:password,
            copassword:copassword,
            checkbox:checkbox.checkbox?'0':'1'
        }
            fetch('/api/register/',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(data),
            })
            .then(response => {
                // Check if response is JSON
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Response not JSON");  // Handle HTML error page or other non-JSON response
                }
                return response.json();  // Parse JSON if valid
            })
            .then(data=>{
                if(data.status=='Success'){
                    document.getElementById('fnameErr').innerText=''
                    document.getElementById('lnameErr').innerText=''
                    document.getElementById('usernameErr').innerText=''
                    document.getElementById('emailErr').innerText=''
                    document.getElementById('roleErr').innerText=''
                    document.getElementById('passwordErr').innerText=''
                    document.getElementById('copasswordErr').innerText=''
                    document.getElementById('formErr').innerText=''
                    document.getElementById('RegisterForm').reset()
                    document.getElementById('msg').innerText="You are Registered Successfully"
                    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                    successModal.show();
                }
                else{
                   for(let key in data.errors){
                    document.getElementById('fnameErr').innerText=''
                    document.getElementById('lnameErr').innerText=''
                    document.getElementById('usernameErr').innerText=''
                    document.getElementById('emailErr').innerText=''
                    document.getElementById('emailErr').innerText=''
                    document.getElementById('passwordErr').innerText=''
                    document.getElementById('copasswordErr').innerText=''
                    document.getElementById('formErr').innerText=''
                    switch(key){
                        case 'isvalidfname':document.getElementById('fnameErr').innerText=data.errors[key];continue;
                        case 'isvalidlname':document.getElementById('lnameErr').innerText=data.errors[key];continue;
                        case 'username':document.getElementById('usernameErr').innerText=data.errors[key];continue;
                        case 'isvalidemail':document.getElementById('emailErr').innerText=data.errors[key];continue;
                        case 'isvalidpassword':document.getElementById('passwordErr').innerText=data.errors[key];continue;
                        case 'isvalidCopassword':document.getElementById('copasswordErr').innerText=data.errors[key];continue;
                        case 'isvalidcheck':document.getElementById('formErr').innerText=data.errors[key];
                        continue;
                        case 'email':document.getElementById('emailErr').innerText=data.errors.email[0]; continue;
                        default : document.getElementById('formErr').innerText=data.errors[key]
                    }
                   }
                }
            })
            .catch((error)=>{
                document.getElementById('msg').innerText=error
            })
            .finally(() => {
                // Hide loader and re-enable the submit button
                loader.style.display = 'none';
                submitButton.disabled = false;
            });
      
       
    }
    return isValid;
}

document.getElementById('fname').addEventListener('input', () => {
    document.getElementById('fname').style.border='1px solid blueviolet'
    const fname = document.getElementById('fname').value;
    const fnameErr = document.getElementById('fnameErr');
    console.log(fname)
    // Check for leading or trailing spaces
    if (/^\s|\s$/.test(fname)) {
        fnameErr.innerText = 'Name cannot have leading or trailing spaces';
    }else if (/\s{2,}/.test(fname)) {
        fnameErr.innerText = 'Name cannot contain multiple consecutive spaces.';
    }else if(!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(fname)){
        fnameErr.innerText = 'Name can only contain letter and spaces';
    }else if (fname.trim().length < 2) {
        fnameErr.innerText = 'Name must be at least 2 characters long.';
    } else {
        fnameErr.innerText = ''; // Clear error message if validation passes
    }
});


document.getElementById('lname').addEventListener('input',()=>{
    const lname=document.getElementById('lname').value;
    const lnameErr=document.getElementById('lnameErr');
    if (/^\s|\s$/.test(lname)) {
        lnameErr.innerText= 'Name cannot have leading spaces';
    }else if (/\s{2,}/.test(lname)) {
        lnameErr.innerText = 'Last Name cannot contain spaces.';
    }else if(!/^[a-zA-Z]*$/.test(lname)){
        lnameErr.innerText = 'Last Name can only contain single word';
    }else if (lname.trim().length < 2) {
        lnameErr.innerText = 'Last Name must be at least 2 characters long.';
    } else {
        lnameErr.innerText = ''; // Clear error message if validation passes
    }
})
document.getElementById('userName').addEventListener('input', () => {
    document.getElementById('userName').style.border = '1px solid blueviolet';
  
    const uname = document.getElementById('userName').value.trim();
  
    // Check for empty username
    if (uname === '') {
      document.getElementById('usernameErr').textContent = 'Username is required.';
      return;
    }
  
    // Check for valid username
    if (!usernameValidation(uname)) {
      document.getElementById('usernameErr').textContent = 'Invalid username.';
      return;
    }
  
    // Check for prohibited words (example)
    const prohibitedWords = ['admin', 'root'];
    if (prohibitedWords.some(word => uname.toLowerCase().includes(word))) {
      document.getElementById('usernameErr').textContent = 'This username is not allowed.';
      return;
    }
  
    document.getElementById('usernameErr').textContent = ''; // Clear error message if valid
  });
document.getElementById('email').addEventListener('input', () => {   
    document.getElementById('email').style.border='1px solid blueviolet'

    const email = document.getElementById('email').value;
    document.getElementById('emailErr').textContent = validateEmail(email) ? '' : 'Invalid email format.';
    
});
document.getElementById('password').addEventListener('input', () => {
    // Set the border color to blueviolet on input
    document.getElementById('inp').style.border = '1px solid blueviolet';

    const password = document.getElementById('password').value;
    let errorMessage = '';

    // Check if the password contains at least one capital letter
    if (!/[A-Z]/.test(password)) {
        errorMessage = 'Password must contain at least one capital letter.';
    }
    // Check if the password length is at least 8 characters
    else if (password.length < 8) {
        errorMessage = 'Password must be at least 8 characters long.';
    }
    // Check if the password contains at least one number
    else if (!/\d/.test(password)) {
        errorMessage = 'Password must contain at least one number.';
    }
    // Check if the password contains at least one special character
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errorMessage = 'Password must contain at least one special character.';
    }

    // Update the error message if any condition fails
    document.getElementById('passwordErr').textContent = errorMessage;
});

    document.getElementById('copassword').addEventListener('input', () => {
    document.getElementById('cinp').style.border='1px solid blueviolet'
        const password = document.getElementById('password').value;
        const rePassword = document.getElementById('copassword').value;
        document.getElementById('copasswordErr').textContent = (password === rePassword) ? '' : 'Passwords do not match.';
    });



const nameValidation=(name)=>/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(name);
const lnameValidation=(lname)=>/^[a-zA-Z]*$/.test(lname);
const usernameValidation = (uname) => /^(?=.{3,16}$)(?!.*[_.]{2})[a-zA-Z][a-zA-Z0-9._]+[a-zA-Z0-9]$/.test(uname);
const validateEmail = (email) => {
    // Regular expression to match a valid email format
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Match the email using regex
    const matchs = email.match(regex);

    // If email does not match the regex pattern, return false
    if (!matchs) {
        return false;
    }

    // Split the email into local and domain parts
    const [localPart, domain] = email.split('@');

    // Split domain into primary and secondary parts (if applicable)
    const domainParts = domain.split('.');
    const firstDomain = domainParts[0];
    const secondDomain = domainParts[1] || '';

    // Check for consecutive dots or hyphens in the local part or domain part
    if (localPart.includes('..') || domain.includes('..') || domain.includes('--')) {
        return false;
    }

    // Check if the second domain part is the same as the first domain (e.g., "example.example.com" should be invalid)
    if (secondDomain && firstDomain.toLowerCase() === secondDomain.toLowerCase()) {
        return false;
    }

    // Check for invalid domain extensions
    if (
        /\.com\..+/i.test(email) ||          // Prevent .com. followed by anything
        /\.gov\.in\..+/i.test(email) ||      // Prevent .gov.in. followed by anything
        /\.edu\.in\..+/i.test(email) ||      // Prevent .edu.in. followed by anything
        /\.(\w+)\.\1/i.test(email)           // Prevent duplicate domains (e.g., .com.com)
    ) {
        return false;
    }

    // List of allowed domain extensions
    const allowedDomains = [
        "com", "org", "gov", "edu", "net", "info", "biz", "me", "pro",
        "gov.in", "edu.in", "ac.in", "org.in", "com.in", "co.in",
        "gov.uk", "ac.uk", "org.uk", "co.uk",
        "gov.au", "edu.au", "com.au", "org.au",
        "gov.sg", "edu.sg", "com.sg",
        "gov.ca", "com.ca", "edu.ca",
        "gov.cn", "edu.cn", "com.cn",
        "gov.jp", "edu.jp",
        "gov.za", "edu.za",
        "gov.br", "gov.ru",
        "tech", "health", "ai", "io", "cloud", "tv", "news", "bank", "finance",
        "eu", "uk", "ca", "au", "sg", "jp", "br" // Regional and international domains
    ];

    // Create a regex pattern for allowed domains
    const domainPattern = new RegExp(
        `(${allowedDomains.map((d) => d.replace(".", "\\.")).join("|")})$`,
        "i"
    );

    // Validate against allowed domains
    if (!domainPattern.test(email)) {
        return false; // Invalid email domain
    }

    // If everything is valid, return true
    return true;
};


//   const validateNumber = (number, length) => new RegExp(`^\\d{${length}}$`).test(number);
  const validatePassword = (password) => /^(?=[A-Za-z])(?=.*[A-Za-z])(?=.*\d)(?=.{8,})/.test(password);

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
