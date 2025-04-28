
document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = "{{ site.env.GH_API_TOKEN }}";
    const commentElements = document.querySelectorAll(".comment-count");

    // GitHub API request function
    async function fetchCommentCount(postPath) {

        const query = `
        query {
            repository(owner: "tillg", name: "grtnr.com_2024") {
                discussions(first: 100, categoryId: "DIC_kwDONYRp_c4Cm0cH") {  
                    nodes {
                        title
                        url
                        comments {
                            totalCount
                        }
                    }
                }
            }
        }`;

        try {
            const response = await fetch("https://api.github.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ` + accessToken
                },
                body: JSON.stringify({ query }),
            });

            // Parse response body only once and store in result.
            const result = await response.json();

            if (!response.ok) {
                console.error("GitHub API error details:", result);
                throw new Error(`GitHub API error: ${response.status}`);
            }

            if (!result.data) return null;

            const discussions = result.data.repository.discussions.nodes;

            // Find the discussion that matches the post's URL
            const discussion = discussions.find(d => postPath.includes(d.title));

            return discussion ? discussion.comments.totalCount : 0;
        } catch (error) {
            console.error("Failed to fetch Giscus comment count:", error);
            return 0;
        }
    }

    // Loop through all comment placeholders and update them
    commentElements.forEach(async (el) => {
        const postPath = el.getAttribute("data-giscus-comments");
        const count = await fetchCommentCount(postPath);
        if (count == 1) {
            el.querySelector(".comment-num").textContent = "1 comment ";
        } else if (count > 1) {
            el.querySelector(".comment-num").textContent = count + " comments ";
        } else {
            el.querySelector(".comment-num").textContent = "";
        }
    });
});
