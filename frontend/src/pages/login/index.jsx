import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";

function LoginComponent() {

    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const router = useRouter();

    const [userLoginMethod, setUserLoginMethod] = useState(true);

    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        if (authState.isSuccess) {
            setUserLoginMethod(true)
        }
    },[authState.isSuccess])

    useEffect(() => {
        if (authState.loggedIn) {
            router.push("/dashboard");
        }
    }, [authState.loggedIn, router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {

    console.log("LOGIN CLICKED");

    if (userLoginMethod) {

        dispatch(loginUser({
            email: formData.email,
            password: formData.password
        }));

    } else {

        dispatch(registerUser(formData));

    }
};

    return (
        <UserLayout>
            <div className={styles.container}>
                <div className={styles.cardContainer}>

                    {/* LEFT FORM */}
                    <div className={styles.cardContainer_left}>

                        <p className={styles.cardLeft_heading}>
                            {userLoginMethod ? "Sign In" : "Sign Up"}
                        </p>
                        {authState.message && (
                        <p style={{ color: "green", marginBottom: "10px" }}>
                                {authState.message.message || authState.message}
                        </p>
                        )}

                        <div className={styles.inputContainers}>

                            {!userLoginMethod && (
                                <div className={styles.inputRow}>

                                    <input
                                        className={styles.inputField}
                                        type="text"
                                        placeholder="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />

                                    <input
                                        className={styles.inputField}
                                        type="text"
                                        placeholder="Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />

                                </div>
                            )}

                            <input
                                className={styles.inputField}
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <input
                                className={styles.inputField}
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <div
                                className={styles.buttonWithOutline}
                                onClick={handleSubmit}
                            >
                                <p>
                                    {authState.isLoading
                                        ? "Processing..."
                                        : userLoginMethod
                                        ? "Sign In"
                                        : "Sign Up"}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* RIGHT PANEL */}
                    <div className={styles.cardContainer_right}>

                        <p>
                            {userLoginMethod
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </p>

                        <button
                            className={styles.switchButton}
                            onClick={() => setUserLoginMethod(!userLoginMethod)}
                        >
                            {userLoginMethod ? "Sign Up" : "Sign In"}
                        </button>

                    </div>

                </div>
            </div>
        </UserLayout>
    );
}

export default LoginComponent;