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
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userCredentials"))
  );
  const [googleAccessToken, setGoogleAccessToken] = useState(null);

  const provider = new GoogleAuthProvider();

  const googleSignin = async () => {
    toast.loading("signing with google..", { theme: "dark" });
    try {
      const result = await signInWithPopup(auth, provider);
      toast.dismiss();
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      if (token) {
        setGoogleAccessToken(token);
        const userCredentials = {
          userName: user.displayName,
          userEmail: user.email,
          credential_token: token,
        };
        localStorage.setItem("userCredentials", JSON.stringify({ userCredentials }));
        setUserData(userCredentials);
        toast.success("signed in successfully", { theme: "dark" });
      } else {
        toast.error("Could not retrieve Google access token.", { theme: "dark" });
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message, { theme: "dark" });
    }
  };

  const googleSignOut = async () => {
    toast.loading("signing you out...", { theme: "dark" });
    try {
      await signOut(auth);
      setUserData(null);
      setGoogleAccessToken(null);
      localStorage.clear();
      toast.dismiss();
      toast.success("signed out", { theme: "dark" });
    } catch (error) {
      toast.dismiss();
      toast.error(error.message, { theme: "dark" });
    }
  };

  const handleUserAuth = () => {
    userData ? googleSignOut() : googleSignin();
  };

  const addEventToCalendar = async (eventData) => {
    if (!googleAccessToken) {
      toast.error("Please sign in with Google to add events.", { theme: "dark" });
      return;
    }

    toast.loading("Adding event to Google Calendar...", { theme: "dark" });
    try {
      const event = {
        summary: eventData.topic,
        start: {
          dateTime: new Date(`${eventData.date}T${eventData.time}:00`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(`${eventData.date}T${eventData.time}:30`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      toast.dismiss();
      if (response.ok) {
        toast.success("Event added to Google Calendar!", { theme: "dark" });
      } else {
        const error = await response.json();
        toast.error(`Failed to add event: ${error.message}`, { theme: "dark" });
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Error adding event: ${error.message}`, { theme: "dark" });
    }
  };

  const handleEvent = async (data) => {
    if (!googleAccessToken) {
      toast.error("Please sign in with Google to add events.", {
        theme: "dark",
      });
      return;
    }

    toast.loading("submitting event...", { theme: "dark" });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.dismiss();
    addEventToCalendar(data);
  };

  useEffect(() => {
    if (userData) {
      setAuthBtnText("logout");
      setAuthBtnBg("bg-red-600");
      setGoogleAccessToken(userData.credential_token);
    } else {
      setAuthBtnText("login");
      setAuthBtnBg("bg-blue-600");
      setGoogleAccessToken(null);
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
              {...register("topic", { required: "Topic is required" })}
              type="text"
              placeholder="Let us know the agenda of meeting"
              className="text-zinc-300 w-full outline-none placeholder-zinc-400"
              required
            />
            {errors.topic && (
              <p className="text-red-500 text-xs italic">{errors.topic.message}</p>
            )}
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
            disabled={isSubmitting || !googleAccessToken}
            className={`col-span-2 py-2 rounded mt-2 ${
              isSubmitting || !googleAccessToken
                ? "cursor-not-allowed bg-green-900"
                : "cursor-pointer bg-green-600"
            }`}
          >
            {isSubmitting
              ? "submitting..."
              : !googleAccessToken
              ? "Please Login"
              : "Add to Calendar"}
          </button>
        </form>
      </section>
      <ToastContainer />
    </div>
  );
};

export default App;