import React, { useState , useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "./firebase/config";

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [authBtnText, setAuthBtnText] = useState("");
  const [authBtnBg, setAuthBtnBg] = useState("")
  //fetching the user credentials from the local storage
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem('userCredentials'))
  )


  //google sign in functionality

  const provider = new GoogleAuthProvider();

  const googleSignin = async () => {
    toast.loading('signing with google..' , {theme : 'dark'})
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    }).then(() => {
      signInWithPopup(auth, provider)
        .then((result) => {
          toast.dismiss();
          const credentials = GoogleAuthProvider.credentialFromResult(result);
          const token = credentials.accessToken;
          const user = result.user;

          const userCredentials = {
            userName: user.displayName,
            userEmail: user.email,
            credential_token: token,
          }

          localStorage.setItem(
            "userCredentials",
            JSON.stringify({
              userCredentials
            })
          );
          setUserData(userCredentials)
          toast.success('signed in successfully' , {theme: 'dark'})
        })
        .catch((errors) => {
          toast.dismiss();
          toast.error(errors.message);
        });
    });
  };

  // google logout functionality 
  const googleSignOut = async () =>{
    toast.loading('signing you out...' , {theme : 'dark'})
    await new Promise((resolve) =>{
      setTimeout(() => {
        resolve()
      }, 1500);
    }).then(() =>{
      signOut(auth).then(() =>{
        setUserData(null);
        toast.dismiss();
        localStorage.clear();
        toast.success('signed out' , {theme : 'dark'})
      }).catch((error) =>{
        toast.dismiss()
        toast.error(error.message);
      })
    })
  }

  // handle user signup and signin 
  const handleUserAuth = () =>{
    userData ? googleSignOut() : googleSignin()
  }

  //form submit functionality
  const handleEvent = async (data) => {
    toast.loading("submitting", { theme: "dark" });
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    }).then(() => {
      toast.dismiss();
      toast.success("Event submitted successfully", { theme: "dark" });
      console.log(data);
    });
  };

  useEffect(() =>{
    if(userData){
      setAuthBtnText("logout")
      setAuthBtnBg("bg-red-600")
    }else{
      setAuthBtnText("login")
      setAuthBtnBg("bg-blue-600")
    }
  },[userData])

  return (
    <div className="bg-zinc-800 h-screen">
      <header className="flex justify-end px-5 py-3">
        <button onClick={handleUserAuth} className={`${authBtnBg} px-5 py-1 rounded-lg text-white cursor-pointer`}>
          {authBtnText}
        </button>
      </header>
      <section className="text-white">
        <form
          onSubmit={handleSubmit(handleEvent)}
          className="w-[30vw] grid grid-cols-2 gap-2 mx-auto pt-12"
        >
          <fieldset className="border border-zinc-500 py-1 px-2 rounded-md col-span-2">
            <legend className="text-zinc-200 px-1">Topic</legend>
            <input
              {...register("topic")}
              type="text"
              placeholder="Let us know the agenda of meeting"
              className="text-zinc-300 w-full outline-none placeholder-zinc-400"
            />
          </fieldset>
          <fieldset className="border border-zinc-500 py-1 px-2 rounded-md">
            <legend className="text-zinc-200 px-1">Date</legend>
            <input
              {...register("date")}
              type="date"
              className="text-zinc-300 w-full outline-none"
            />
          </fieldset>
          <fieldset className="border border-zinc-500 py-1 px-2 rounded-md">
            <legend className="text-zinc-200 px-1">Time</legend>
            <input
              {...register("time")}
              type="time"
              className="text-zinc-300 w-full outline-none"
            />
          </fieldset>
          <button
            disabled={isSubmitting}
            className={`col-span-2 py-2 rounded mt-2 ${
              isSubmitting
                ? "cursor-not-allowed bg-green-900"
                : "cursor-pointer bg-green-600"
            }`}
          >
            {isSubmitting ? "submitting..." : "submit"}
          </button>
        </form>
      </section>
      <ToastContainer />
    </div>
  );
};

export default App;
