// function decodeToken(token) {
//     const payload = token.split('.')[1]; // Get the payload part of the token
//     return JSON.parse(atob(payload));
//     }
// function setTokenRefreshTimer() {
//     const accessToken = localStorage.getItem('token');
//     const refreshToken = localStorage.getItem('refresh_token');

//     if (accessToken && refreshToken) {
//         const decodedToken = decodeToken(accessToken);
//         const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
//         const currentTime = Date.now();
//         const timeUntilExpiry = expiryTime - currentTime;

//         // Set a timer to refresh the token 1 minute before expiry
//         if (timeUntilExpiry > 60000) {
//             setTimeout(() => {
//                 refreshAccessToken(refreshToken);
//             }, timeUntilExpiry - 60000); // Refresh 1 minute before expiry
//         } else {
//             refreshAccessToken(refreshToken); // Token is close to expiry, refresh immediately
//         }
//     }
// }

// async function refreshAccessToken(refreshToken) {
//     try {
//         const response = await fetch('/api/token/refresh/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ refresh: refreshToken }),
//         });

//         if (response.ok) {
//             const data = await response.json();
//             localStorage.setItem('token', data.access);
//             console.log('Access token refreshed');
//             setTokenRefreshTimer(); // Set timer for the next refresh
//         } else {
//             console.error('Failed to refresh token, logging out');
//             logoutUser();
//         }
//     } catch (error) {
//         console.error('Error refreshing token:', error);
//         logoutUser();
//     }
// }