import "./App.css";
import { Button } from "./shared/Button/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";

import { LeftMenu } from "./modules/LeftMenu/LeftMenu";
import { useAuth } from "./store/authContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Outlet } from "react-router-dom";
import { useSideMenu } from "./store/sideMenuContext";
import { useMedia } from "./store/mediaContext";

function App() {
  const { isLoading, user, createUser } = useAuth();
  const { isDesktop } = useMedia();
  const { leftMenu, setLeftMenu } = useSideMenu();

  return (
    <div className=" relative flex">
      <LeftMenu></LeftMenu>
      <div className="flex flex-1 flex-col min-w-0  min-h-screen">
        {isDesktop && (
          <Button
            variant="outline"
            onClick={() => {
              setLeftMenu((prev) => !prev);
            }}
            className=" shadow-[2px_2px_5px_#0008] px-0 fixed  top-[120px] z-10"
          >
            {leftMenu ? (
              <ArrowLeftIcon size={22}></ArrowLeftIcon>
            ) : (
              <ArrowRightIcon size={22}></ArrowRightIcon>
            )}
          </Button>
        )}

        <Outlet></Outlet>
      </div>
      {isLoading && (
        <div className=" min-w-[320px] z-30 flex justify-center items-center fixed inset-0 bg-[rgba(0,0,0,0.5)]">
          <h1>Loading...</h1>
        </div>
      )}
      {!user && !isLoading && (
        <div className=" min-w-[320px] z-30 flex justify-center items-center fixed inset-0 bg-[rgba(0,0,0,0.5)]">
          <div className="translate-y-[-30%] shadow-[2px_2px_5px_5px_#0003] rounded-[30px] bg-(--bg) w-4/5 h-2/5 md:w-2/3 py-10">
            <h1>Hello!</h1>
            <p>Create a unique username </p>

            <Formik
              initialValues={{ username: "" }}
              validate={(values) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const errors: any = {};
                if (!values.username) {
                  errors.username = "Required";
                } else if (values.username.length < 4) {
                  errors.username = "Username must be more than 4 characters";
                }
                return errors;
              }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await createUser(values.username);
                // eslint-disable-next-line no-empty
                } catch {}
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="min-w-[0px] mt-5 gap-8 flex flex-col items-center justify-center w-full">
                  <div className="flex flex-col gap-1 items-start min-w-[0px] w-2/3 md:w-1/3 ">
                    <label className="text-[18px]" htmlFor="input-username">
                      Username
                    </label>
                    <Field
                      id="input-username"
                      placeholder="example:Petro2026"
                      className=" text-(text-h) font-[500] bg-(--bg) min-w-[0px] max-w-[600px] w-full rounded-[8px] px-4 py-3 scrollbar-none max-h-[100px] resize-none border border-black/30"

                      type="username"
                      name="username"
                    />
                    <ErrorMessage
                      name="username"
                      className="text-[red]"
                      component="div"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex text-[28px] px-14 py-6"
                  >
                    Start
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

