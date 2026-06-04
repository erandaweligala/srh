export const ErrorMessages: Map<string, string> = new Map(
    [
        ["UMS1000", "Your request successfully submitted"],
        ["UMS2000", "User registration failed"],
        ["UMS2001", "Invalid Status"],
        ["UMS3001", "User registration failed."],
        ["UMS3002", "Entered username already registered to an account. Please choose a different username"], //This Username has been already taken
        ["UMS3003", "Passwords does not match. Please try again"], //Passwords do not match
        ["UMS3004", "Please enter a valid E-mail"], //Invalid Email Format
        ["UMS3005", "Entered e-mail address already registered to an account. Please choose a different email address"], //This Email has been already taken
        ["UMS3006", "Entered mobile number already have an account. Please choose a different mobile number or login with the existing account"], //This Mobile Number has been already taken
        ["UMS3007", "Password must be between 8 and 12 characters"],
        ["UMS3008", "Password must contain at least one uppercase letter"],
        ["UMS3009", "Password must contain at least one lowercase letter"],
        ["UMS3010", "Password must contain at least one digit"],
        ["UMS3011", "Password must contain at least one special character"],
        ["UMS3012", "Entered password is too common. Please choose a different password"],
        ["UMS3013", "Entered password contains too many repeated characters. Please choose a different password"],
        ["UMS3014", "Password must not contain parts of user information"],
        ["UMS3015", "Invalid credentials. Please try again"], //Error Occurred While Generating Forget Password Email
        ["UMS3016", "An Error occurred while Retrieving the Enterprise User Details"], //User has not been approved yet
        ["UMS3017", "An Error occurred while creating the User token"], //Error occurred while creating the User token
        ["UMS3018", "An Error occurred while creating the User token"], //Invalid User Token
        ["UMS3019", "An Error occurred while creating the User token"], //User Token has been Expired
        ["UMS3020", "An Error occurred while creating the User token"], //Error Occurred While Validating the User in Forget Password
        ["UMS3021", "An Error Occurred While Calling the External API"], //Error Occurred While Calling the External API
        ["UMS3022", "An Error Occurred While Calling the External API"], //New password cannot match last 3 used passwords
        ["UMS3023", "An Error Occurred While Calling the External API"], //Invalid session token
        ["UMS3024", "Something went wrong! Please try again shortly"], //Error Occurred while Retrieving the Application Configurations
        ["UMS3025", "Your Account is Temporarily Locked. Please contact support for further assistance"], //Account is Temporarily Locked
        ["UMS3026", "Invalid login credentials. Please try again"], //Invalid login credentials. Please try again
        ["UMS3027", "Something went wrong! Please try again shortly"], //Error occurred while Retrieving the Enterprise User Details
        ["UMS3028", "Invalid Mobile Number Format. Please check the number and try again!"], //Invalid MSISDN Format Found
        ["UMS3029", "Something went wrong! Please try again shortly"], //Error occurred while Retrieving the Enterprise User List
        ["UMS3030", "User does not exists or in Pending status"], //User not found or status not pending
        ["UMS3031", "Something went wrong! Please try again shortly"], //Error occurred while Approving the Enterprise User
        ["UMS3032", "Something went wrong! Please try again shortly"], //Error Occurred While Calling the External API
        ["UMS3033", "Something went wrong! Please try again shortly"], //Error Occurred While getting recent activity list
        ["UMS3034", "Something went wrong! Please try again shortly"], //Error Occurred While decrypting a sensitive data
        ["UMS3035", "Something went wrong! Please try again shortly"], //Data Encryption Failed
        ["UMS3036", "Something went wrong! Please try again shortly"], //Data Decryption Failed
        // UMS3037 Reset Request Count Exceeded. Please try again after %d Hour(s): do not map this from frontend
        ["UMS3038", "User did not Accept the Terms & Conditions and Privacy Policy"], //User did not Accept the Terms & Conditions and Privacy Policy
        ["UMS3039", "User has Rejected the Terms & Conditions and Privacy Policy"], //User has Rejected the Terms & Conditions and Privacy Policy
        ["UMS3040", "Something went wrong! Please try again shortly"], //Error occurred while Retrieving the Enterprise Role List
        ["UMS3041", "Something went wrong! Please try again shortly"], //Error Occurred While creating enterprise activity
        ["UMS3042", "Invalid Account Number. Please check and try again"], //Approving User's Account Number Validation Failed
        ["UMS3043", "Something went wrong! Please try again shortly"], //Response Data List from the External API is empty
        ["UMS3044", "Something went wrong! Please try again shortly"], //Received an Unexpected Response Format from the External API
        ["UMS3045", "Something went wrong! Please try again shortly"], //Data from the External API is empty
        ["UMS3046", "Something went wrong! Please try again shortly"], //Response Body from the External API is empty
        ["UMS3047", "Invalid Account Number. Please check and try again"], //Customer Data Missing from the Customer List API Response
        ["UMS3048", "Invalid Account Number. Please check and try again"], //STATUS Data Missing from the Customer in Customer List API Response
        ["UMS3049", "Something went wrong! Please try again shortly"], //
        ["SAM2009", "Mobile Number cannot be null"],
        ["SAM3000", "An Unexpected error occurred"],
        ["SAM3001", "Unable to login. Please try again or contact support"],
        ["SAM3017", "Sorry! The requested Subscriber has been blocked. Please contact support for further assistance"],
        ["SMS2001", "An Error occurred while Retrieving account list failed"], //Invalid msisdn
        ["SMS3001", "An Error occurred while Retrieving account list failed"],
        ["OTP3006", "Entered OTP does not match. Please try again"],
        ["PMS3007", "Invalid voucher pin entered. Please try again or contact support"],
        ["PMS3009", "An Error occurred while completing MyZaka payment"],
        ["BLMS3003", "Balance transfer failed. Please try again or contact support"],
        ["CMS2000", "An Error occurred while Retrieving recent configurations failed"], //Invalid Channel
        ["CMS2001", "An Error occurred while Retrieving system configurations failed"], //Invalid source channel //Invalid msisdn
        ["CMS3001", "An Error occurred while Retrieving recent activities failed"],
        ["BMS2001", "An Error occurred while Retrieving loyalty points failed"], //Invalid msisdn //Invalid transaction token
        ["BMS3001", "An Error occurred while Retrieving loyalty points failed"],
        ["PMS2001", "An Error occurred while completing the payment"], //Invalid MISISDN //Invalid customer id //Invalid Channel
        ["PMS3001", "An Error occurred while completing the payment"], //Error occurred while validating the user //Error occurred while getting customer’s payments //Error occurred while updating status

            ["AUM2001", "Something went wrong! Please try again shortly"], //Error Occurred While Calling the External API
            ["AUM2002", "Something went wrong! Please try again shortly"], //Error Occurred While Getting the Roles
            ["AUM2003", "Something went wrong! Please try again shortly"], //Error Occurred While Getting the Role Details
            ["AUM2004", "Something went wrong! Please try again shortly"], //Error Occurred While Creating the Roles
            ["AUM2005", "Something went wrong! Please try again shortly"], //Error Occurred While Updating the Roles
            ["AUM2006", "Something went wrong! Please try again shortly"], //Error Occurred While Deleting the Roles
            ["AUM3000", "Something went wrong! Please try again shortly"], //Unauthorized Access
            ["AUM3001", "Something went wrong! Please try again shortly"], //User Validation Failed
            ["AUM3002", "Something went wrong! Please try again shortly"], //User Creation Failed
            ["AUM3003", "User Already Exists with Same Email. Please check the Email"], //User Already Exists with Same Email
            ["AUM3004", "Something went wrong! Please try again shortly"], //User Creation Failed due to Unauthorized Token
            ["AUM3005", "Something went wrong! Please try again shortly"], //Error Occurred from KeyCloak
            ["AUM3006", "Something went wrong! Please try again shortly"], //Update User Failed
            ["AUM3007", "Something went wrong! Please try again shortly"], //User Update Failed due to Unauthorized Token
            ["AUM3008", "User not Found for the given User ID"], //User ID not found for the updated user
            ["AUM3009", "Something went wrong! Please try again shortly"], //User Role Update Failed due to Unauthorized Token
            ["AUM3010", "User not Found!"], //User Does Not Exists
            ["AUM3011", "Something went wrong! Please try again shortly"], //Get Roles Failed due to Unauthorized Token
            ["AUM3012", "Something went wrong! Please try again shortly"], //Get Role By Name Failed due to Unauthorized Token
            ["AUM3013", "Role not Found!"], //Role Does Not Exists
            ["AUM3014", "Something went wrong! Please try again shortly"], //Get Role Details Failed due to Unauthorized Token
            ["AUM3015", "Something went wrong! Please try again shortly"], //Update Role Details Failed due to Unauthorized Token
            ["AUM3016", "Something went wrong! Please try again shortly"], //Delete Role Details Failed due to Unauthorized Token
            ["AUM3017", "Something went wrong! Please try again shortly"], //Delete User Failed
            ["AUM3018", "Something went wrong! Please try again shortly"], //User Update Failed due to Unauthorized Token
            ["AUM3019", "Something went wrong! Please try again shortly"], //User Binding Failed due to Unauthorized Token
            ["AUM3020", "Something went wrong! Please try again shortly"], //External API triggered Circuit breaker
            ["AUM3021", "Something went wrong! Please try again shortly"], //Get Users By Role Failed due to Unauthorized Token
            ["AUM3022", "Something went wrong! Please try again shortly"], //Error Occurred while Getting the Admin User List
            ["AUM3023", "Deleting Role Already have assigned Users"], //Deleting Role already have assigned Users
    ]
)
