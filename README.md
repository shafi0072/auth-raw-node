this rest full api build with raw node js.

we don't have used any thirdparty library without dotenv in this project

the api root urls are

\*for signup and log in the api is {

create an user : http://localhost:3000/user {method:post, query: "no query need"}

log in user :http://localhost:3000/user?phone="your phone number" {method:get, query: "need phone number"}

update user : http://localhost:3000/user {method:put, body: "need phone number"}

delete user: http://localhost:3000/user?phone="phone number" {method:delete, query: "need phone number"}

schemas:{
  {
    "firstName":"",
    "lastName":"",
    "phone":"",
    "password":"",
    "tosAgreement": Boolean
}
}

}

\*for token api is {

create an user : http://localhost:3000/token {method:post, query: "no query need"}

log in user :http://localhost:3000/user?phone="your phone number" {method:get, query: "need phone number"}

update user : http://localhost:3000/user {method:put, body: "need phone number"}

delete user: http://localhost:3000/user?phone="phone number" {method:delete, query: "need phone number"}

schemas :{}

}
