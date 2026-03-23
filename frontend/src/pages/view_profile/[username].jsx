import React, { useEffect, useState } from "react";
import { BASE_URL, clientServer } from "@/config";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { getConnectionsRequest, sendConnectionRequest } from "@/config/redux/action/authAction";


export default function ViewProfilePage({ userProfile }) {

    const router = useRouter();
    const dispatch = useDispatch();

    const postReducer = useSelector((state) => state.postReducer);
    const authState = useSelector((state) => state.auth);

    const [userPosts, setUserPosts] = useState([]);
    const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
    const [isConnectionNull, setIsConnectionNull] = useState(true);

    // Load posts + connections
    useEffect(() => {
        dispatch(getAllPosts());

        if (typeof window !== "undefined") {
            dispatch(
                getConnectionsRequest({
                    token: localStorage.getItem("token")
                })
            );
        }
    }, [dispatch]);

    // Filter posts for this user
    useEffect(() => {
        if (!router.query.username) return;

        const posts = postReducer.posts.filter((post) => {
            return post.userId?.username === router.query.username;
        });

        setUserPosts(posts);

    }, [postReducer.posts, router.query.username]);

    // Check if already connected
    useEffect(() => {

    if (!Array.isArray(authState.connections)) return;

    const connection = authState.connections.find(
        (user) => user.connectionId?._id === userProfile.userId._id
    );

    if (connection) {
        setIsCurrentUserInConnection(true);

        if (connection.status_accepted === true) {
            setIsConnectionNull(false);
        } else {
            setIsConnectionNull(true);
        }
    } else {
        setIsCurrentUserInConnection(false);
        setIsConnectionNull(true);
    }

    // ✅ FIXED PART
    if (Array.isArray(authState.connectionRequest)) {

        const req = authState.connectionRequest.find(
            (user) => user.userId?._id === userProfile.userId._id
        );

        if (req) {
            setIsCurrentUserInConnection(true);

            if (req.status_accepted === true) {
                setIsConnectionNull(false);
            } else {
                setIsConnectionNull(true);
            }
        }
    }

}, [authState.connections, authState.connectionRequest, userProfile.userId._id]);
    console.log(userProfile);

    return (
        
        <UserLayout>
            <DashboardLayout>

                <div className={styles.container}>

                    {/* Cover */}
                    <div className={styles.backDropContainer}>
                        <img
                            className={styles.backDrop}
                            src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                            alt="cover"
                        />
                    </div>

                    {/* Profile Info */}
                    <div className={styles.profileContainer_details}>

                        <div className={styles.profileContainer_flex}>

                            {/* LEFT SIDE */}
                            <div style={{ flex: "0.8" }}>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <h2>{userProfile.userId.name}</h2>
                                    <p style={{ color: "grey" }}>
                                        @{userProfile.userId.username}
                                    </p>
                                </div>

                                {/* CONNECT BUTTON */}
                                <div style={{display:"flex", alignItems:"center", gap:"1.2rem"}}>
                                {isCurrentUserInConnection ? (
                                    <button className={styles.connectedButton}>
                                        {isConnectionNull ? "Pending" : "Connected"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            dispatch(
                                                sendConnectionRequest({
                                                    token: localStorage.getItem("token"),
                                                    connectionId: userProfile.userId._id
                                                })
                                            );
                                        }}
                                        className={styles.connectBtn}
                                    >
                                        Connect
                                    </button>
                                    )}
                                    <div onClick={async() => {
                                        window.open(`${BASE_URL}/user/download_resume?id=${userProfile.userId._id}`, "_blank");
                                    }} style={{cursor:"pointer"}}>
                                        <svg style={{width:"1.2em"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>

                                    </div>
                                    </div>

                                {/* BIO */}
                                <p style={{ marginTop: "10px", color: "#555", maxWidth: "600px" }}>
                                    {userProfile.bio || "No bio available"}
                                </p>

                            </div>

                            {/* RIGHT SIDE */}
                            <div style={{ flex: "0.2" }}>
                                <h3>Recent Activity</h3>

                                {userPosts.map((post) => {
                                    return (
                                        <div key={post._id} className={styles.postCard}>

                                            <div className={styles.card}>
                                                <div className={styles.card_profileContainer}></div>

                                                {post.media && (
                                                    <img
                                                        src={`${BASE_URL}/${post.media}`}
                                                        alt="post"
                                                        style={{
                                                            width: "3.4rem",
                                                            height: "3.4rem",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <p>{post.body}</p>

                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                    </div>

                    {/* WORK HISTORY */}
                    <div className="workHistory">
                        <h4>Work History</h4>

                        <div className={styles.workHistoryContainer}>
                            {userProfile.postWork?.map((work, index) => {
                                return (
                                    <div key={index} className={styles.workHistoryCard}>
                                        <p style={{ fontWeight: "bold",display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                            {work.company} - {work.position}
                                        </p>
                                        <p>{work.years}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </DashboardLayout>
        </UserLayout>
    );
}

export async function getServerSideProps(context) {

    const request = await clientServer.get(
        "/user/get_profile_based_on_username",
        {
            params: {
                username: context.query.username
            }
        }
    );

    return {
        props: {
            userProfile: request.data.profile
        }
    };
}