import styles from '../../styles/Slug.module.css';
import { GraphQLClient, gql } from 'graphql-request';
import Link from 'next/link';


const graphcms = new GraphQLClient('https://api-ap-south-1.graphcms.com/v2/cl4wufpfg0aee01ui5242b6ta/master');

const QUERY = gql`
query Post($slug: String!) {
    post(where: {slug: $slug}) {
        id,
        title,
        slug,
        datePublished,
        author{
            id,
            name,
            avatar{
            url
            }
            about {
                html
            }
            rights {
                html
            }
        }
        content {
            html
        }
        coverPhoto {
            id, 
            url
        }
    }
  }
`;

const SLUGLIST = gql`
  {
    posts{
        slug
    }
  }
`;

export async function getStaticPaths() {
    const {posts} = await graphcms.request(SLUGLIST);
    return{
        paths: posts.map(post => ({params: {slug: post.slug }})),
        fallback: false
    }
}


export async function getStaticProps({params}) {
    const slug = params.slug;
    const data = await graphcms.request(QUERY, {slug});
    const post = data.post;

    return {
        props: {
        post,
        },
        revalidate: 10,
    };
}



export default function blogPost({post}) {
    return(
        <div>
            <nav className={styles.mainNav}>
                <ul className={styles.navList}>
                    <li><Link href='/' className={styles.navLink}>Home</Link></li>
                    <li>About</li>
                    <li>Contact Us</li>
                </ul>
            </nav>
            <main className={styles.blog}>
                <img src={post.coverPhoto.url} alt="" className={styles.cover} />
                <div className={styles.title}>
                    <img src={post.author.avatar.url} alt="" />
                    <div className={styles.authtext}>
                        <h6>By {post.author.name}</h6>
                        <h6 className={styles.date}>{post.datePublished}</h6>
                    </div>
                </div>
                <h1>{post.title}</h1>
                <div className={styles.content} dangerouslySetInnerHTML={{__html: post.content.html}}></div>
            </main>
            <footer className={styles.foot}>
                <h1>About Us</h1>
                <div className={styles.about}>
                    <div style={{color: 'red'}} className={styles.inner} dangerouslySetInnerHTML={{__html: post.author.about.html}}></div>
                    <img src={post.author.avatar.url} alt="" className={styles.cover} />
                </div>
                <div className={styles.contact}>
                    <h3>Contact Me</h3>
                    <div>
                        <input type='text' name='text' placeholder='Enter Email'/>
                        <button type='submit' >Send</button>
                    </div>
                </div>
                <div className={styles.rights} dangerouslySetInnerHTML={{__html: post.author.rights.html}}></div>
            </footer>
        </div>
    )
}