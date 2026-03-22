import mongoose from 'mongoose';

const homeSchema = new mongoose.Schema({
    heroSection: {
        title: {
            type: String,
            default: "Welcome to Our Website"
        },
        subtitle: {
            type: String,
            default: "Your journey starts here"
        },
        backgroundImage: {
            type: String,
            default: ""
        },
        ctaButton: {
            text: {
                type: String,
                default: "Get Started"
            },
            link: {
                type: String,
                default: "/contact"
            }
        }
    },
    aboutSection: {
        title: {
            type: String,
            default: "About Us"
        },
        content: {
            type: String,
            default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        image: {
            type: String,
            default: ""
        }
    },
    servicesSection: {
        title: {
            type: String,
            default: "Our Services"
        },
        services: [{
            icon: String,
            title: String,
            description: String
        }]
    },
    gallerySection: {
        title: {
            type: String,
            default: "Our Gallery"
        },
        images: [{
            url: String,
            caption: String,
            order: Number
        }]
    },
    contactSection: {
        title: {
            type: String,
            default: "Contact Us"
        },
        address: String,
        phone: String,
        email: String,
        mapEmbed: String
    },
    metaTags: {
        title: String,
        description: String,
        keywords: [String]
    },
    footerSection: {
        copyright: {
            type: String,
            default: "© 2024 All Rights Reserved"
        },
        socialLinks: [{
            platform: String,
            url: String,
            icon: String
        }]
    }
}, {
    timestamps: true
});

homeSchema.statics.getHomeData = async function() {
    let homeData = await this.findOne();
    if (!homeData) {
        homeData = await this.create({});
    }
    return homeData;
};

const Home = mongoose.model('Home', homeSchema);
export default Home;