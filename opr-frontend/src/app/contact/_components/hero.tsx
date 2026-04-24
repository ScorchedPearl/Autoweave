"use client";
import axios from "axios";
import { SendIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import { useUser } from "@/provider/userprovider";

type FormData = {
  name: string;
  email: string;
  page?: string;
  subject: string;
  message: string;
};

export default function Hero() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const { googleAuth } = useUser();
  const loginPromiseHandlers = useRef<{
    resolve: (value: TokenResponse) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);

  const googleLogin = useGoogleLogin({
    scope:
      "openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.send",
    onSuccess: (cred) => {
      loginPromiseHandlers.current?.resolve(cred);
      loginPromiseHandlers.current = null;
    },
    onError: () => {
      loginPromiseHandlers.current?.reject(new Error("Google login failed"));
      loginPromiseHandlers.current = null;
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      let token = localStorage.getItem("__Google_Access_Token__");

      if (!token) {
        const googleResponse: TokenResponse = await new Promise((resolve, reject) => {
          loginPromiseHandlers.current = { resolve, reject };
          googleLogin();
        });

        token = googleResponse.access_token;
        localStorage.setItem("__Google_Access_Token__", token);
        await googleAuth(token);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Google-Token": token, 
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Email not sent!");
      }

      reset();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("There was an error sending your message.");
    }
  };

  return (
    <div className="min-h-screen bg-black z-auto">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We would love to hear from you! Please fill out the form below and we&#39;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-8">Send us a message</h2>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                      Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                      Email <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="page" className="block text-white text-sm font-medium mb-2">
                      Page Issue Occurred On
                    </label>
                    <input
                      type="text"
                      id="page"
                      {...register("page")}
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-colors"
                      placeholder="Page name (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
                      Subject <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      {...register("subject", { required: "Subject is required" })}
                      className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-colors"
                      placeholder="What's this about?"
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                    Message <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    {...register("message", { required: "Message is required" })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-medium rounded-lg transition-colors duration-200"
                  >
                    <SendIcon size={16} />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 h-fit">
              <h3 className="text-xl font-semibold text-white mb-8">Contact Information</h3>

              <div className="mb-8">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Email
                </div>
                <div className="text-white font-mono text-sm break-all select-all p-3 bg-black border border-zinc-700 rounded-lg">
                  marcellapearl0627@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}