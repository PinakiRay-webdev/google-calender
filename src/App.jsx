import React, { useState, useEffect } from "react";
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
  const [authBtnBg, setAuthBtnBg] = useState("");
  //fetching the user credentials from the local storage
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userCredentials"))
  );

  //google sign in functionality
  const provider = new GoogleAuthProvider();

  const googleSignin = async () => {
    toast.loading("signing with google..", { theme: "dark" });
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    }).then(() => {
      signInWithPopup(auth, provider)
        .then((result) => {
          toast.dismiss();
          const credentials = GoogleAuthProvider.credentialFromResult(result);
          const token = credentials?.accessToken;
          const user = result.user;

          const userCredentials = {
            userName: user.displayName,
            userEmail: user.email,
            credential_token: token,
          };

          localStorage.setItem(
            "userCredentials",
            JSON.stringify({
              userCredentials,
            })
          );
          setUserData(userCredentials);
          toast.success("signed in successfully", { theme: "dark" });
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.message);
        });
    });
  };

  // google logout functionality
  const googleSignOut = async () => {
    toast.loading("signing you out...", { theme: "dark" });
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    }).then(() => {
      signOut(auth)
        .then(() => {
          setUserData(null);
          toast.dismiss();
          localStorage.clear();
          toast.success("signed out", { theme: "dark" });
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.message);
        });
    });
  };

  // handle user signup and signin
  const handleUserAuth = () => {
    userData ? googleSignOut() : googleSignin();
  };

  // Function to add event to Google Calendar
  const addEventToCalendar = async (eventData, accessToken) => {
    try {
      const event = {
        summary: eventData.topic,
        start: {
          dateTime: new Date(
            `${eventData.date}T${eventData.time}:00`
          ).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(
            `${eventData.date}T${eventData.time}:30` // Assuming 30 min event duration
          ).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (response.ok) {
        toast.success("Event added to Google Calendar!", { theme: "dark" });
      } else {
        const error = await response.json();
        toast.error(`Failed to add event to calendar: ${error.message}`, {
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error(`Error adding event to calendar: ${error.message}`, {
        theme: "dark",
      });
    }
  };

  //form submit functionality
  const handleEvent = async (data) => {
    if (!userData?.credential_token) {
      toast.error("Please sign in with Google to add events to your calendar.", {
        theme: "dark",
      });
      return;
    }

    toast.loading("submitting and adding to calendar...", { theme: "dark" });
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    }).then(() => {
      toast.dismiss();
      console.log("Form Data:", data);
      addEventToCalendar(data, userData.credential_token);
    });
  };

  useEffect(() => {
    if (userData) {
      setAuthBtnText("logout");
      setAuthBtnBg("bg-red-600");
    } else {
      setAuthBtnText("login");
      setAuthBtnBg("bg-blue-600");
    }
  }, [userData]);

  return (
    <div className="bg-zinc-800 h-screen">
      <header className="flex justify-end px-5 py-3">
        <button
          onClick={handleUserAuth}
          className={`${authBtnBg} px-5 py-1 rounded-lg text-white cursor-pointer`}
        >
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
              required
            />
          </fieldset>
          <fieldset className="border border-zinc-500 py-1 px-2 rounded-md">
            <legend className="text-zinc-200 px-1">Date</legend>
            <input
              {...register("date", { required: "Date is required" })}
              type="date"
              className="text-zinc-300 w-full outline-none"
              required
            />
            {errors.date && (
              <p className="text-red-500 text-xs italic">{errors.date.message}</p>
            )}
          </fieldset>
          <fieldset className="border border-zinc-500 py-1 px-2 rounded-md">
            <legend className="text-zinc-200 px-1">Time</legend>
            <input
              {...register("time", { required: "Time is required" })}
              type="time"
              className="text-zinc-300 w-full outline-none"
              required
            />
            {errors.time && (
              <p className="text-red-500 text-xs italic">{errors.time.message}</p>
            )}
          </fieldset>
          <button
            disabled={isSubmitting || !userData?.credential_token}
            className={`col-span-2 py-2 rounded mt-2 ${
              isSubmitting || !userData?.credential_token
                ? "cursor-not-allowed bg-green-900"
                : "cursor-pointer bg-green-600"
            }`}
          >
            {isSubmitting
              ? "submitting..."
              : !userData?.credential_token
              ? "Please Login"
              : "submit"}
          </button>
        </form>
      </section>
      <ToastContainer />
    </div>
  );
};

export default App;