import React from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

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

  return (
    <div className="bg-zinc-800 h-screen">
      <header className="flex justify-end px-5 py-3" >
        <button className="bg-blue-600 px-5 py-1 rounded-lg text-white cursor-pointer" >Login</button>
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
          <button disabled={isSubmitting} className={`col-span-2 py-2 rounded mt-2 ${isSubmitting ? "cursor-not-allowed bg-green-900" : "cursor-pointer bg-green-600"}`}>
            {isSubmitting ? "submitting..." : "submit"}
          </button>
        </form>
      </section>
      <ToastContainer />
    </div>
  );
};

export default App;
