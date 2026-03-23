import React, { useEffect } from "react";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function Discoverpage() {

    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (!authState.all_profiles_fetched) {
            dispatch(getAllUsers());
        }
    }, [dispatch, authState.all_profiles_fetched]);

    return (
        <UserLayout>
            <DashboardLayout>

                <div style={{ padding: "20px" }}>
                    <h1>Discover</h1>

                    <div className={styles.allUserProfile}>

                        {authState.all_profiles_fetched &&
                            authState.allUsers.map((user) => {
                                return (
                                    <div
                                        key={user._id}
                                        className={styles.userCard}
                                        onClick={() => {
                                            router.push(`/view_profile/${user.userId.username}`);
                                        }}
                                    >

                                        <img
                                            className={styles.userCard_image}
                                            src={
                                                user.userId?.profilePicture
                                                    ? `${BASE_URL}/${user.userId.profilePicture}`
                                                    : "/default.jpg"
                                            }
                                            alt="profile"
                                        />

                                        <div>
                                            <h3>{user.userId.name}</h3>
                                            <p>@{user.userId.username}</p>
                                        </div>

                                    </div>
                                );
                            })}

                    </div>

                </div>

            </DashboardLayout>
        </UserLayout>
    );
}