// 初始化 AOS（滚动动画）
AOS.init({
    duration: 800,
    once: true
});

// 初始化 Swiper（轮播）
const swiper = new Swiper('.swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    autoplay: {
        delay: 3000,
        disableOnInteraction: false
    }
});

// 鼠标跟随效果
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.cursor-follower');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 平滑跟随效果
    function animate() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.1;
        cursorY += dy * 0.1;
        
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(animate);
    }
    
    animate();

    // 鼠标悬停效果
    const hoverElements = document.querySelectorAll('a, button, .swiper-slide');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(1.5)`;
            cursor.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(1)`;
            cursor.style.background = 'rgba(192, 192, 192, 0.2)';
        });
    });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 创建通用的 Intersection Observer
const commonObserverOptions = {
    threshold: 0.3
};

const commonObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // 如果是视频元素，确保视频播放
            const video = entry.target.querySelector('video');
            if (video) {
                video.play().catch(e => console.log('Video autoplay prevented:', e));
            }
        }
    });
}, commonObserverOptions);

// 观察技能条和 GT 框架
document.querySelectorAll('.skill-progress, .gt-frame').forEach(element => {
    commonObserver.observe(element);
});

// GT Glitch Effect System
document.querySelectorAll('.gt-frame').forEach(frame => {
    frame.addEventListener('mousemove', (e) => {
        const rect = frame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert coordinates to percentages and reduce the effect by half
        const xPercent = (x / rect.width - 0.5);  // -0.5 to 0.5
        const yPercent = (y / rect.height - 0.5); // -0.5 to 0.5
        
        // Calculate rotation angles (max 5 degrees instead of 10)
        const rotateY = xPercent * 5;
        const rotateX = -yPercent * 5;
        
        // Update CSS variables with smoother transition
        frame.style.setProperty('--rotate-x', `${rotateX}deg`);
        frame.style.setProperty('--rotate-y', `${rotateY}deg`);
        
        // Update glitch position with reduced movement
        const glitch = frame.querySelector('.gt-glitch');
        if (glitch) {
            glitch.style.transform = `translate(${xPercent * 2}px, ${yPercent * 2}px) translateZ(20px)`;
        }
    });
    
    frame.addEventListener('mouseleave', () => {
        frame.style.setProperty('--rotate-x', '0deg');
        frame.style.setProperty('--rotate-y', '0deg');
        
        const glitch = frame.querySelector('.gt-glitch');
        if (glitch) {
            glitch.style.transform = 'translate(0) translateZ(20px)';
        }
    });
});

// Title animation logic
document.addEventListener('DOMContentLoaded', () => {
    const titleA = document.querySelector('.title-a');
    const titleB = document.querySelector('.title-b');
    let isAnimating = false;

    // Function to generate random position
    function getRandomPosition() {
        const minDistance = 20; // Minimum distance from edges in percentage
        const maxDistance = 80; // Maximum distance from edges in percentage
        return {
            x: Math.random() * (maxDistance - minDistance) + minDistance,
            y: Math.random() * (maxDistance - minDistance) + minDistance
        };
    }

    // Function to set element position
    function setPosition(element, position) {
        element.style.left = `${position.x}%`;
        element.style.top = `${position.y}%`;
    }

    // Function to animate title switch
    function switchTitles(fromElement, toElement) {
        if (isAnimating) return;
        isAnimating = true;

        // Hide current title
        fromElement.classList.remove('active');

        // Wait for fade out
        setTimeout(() => {
            // Generate and apply new position for the hidden element
            const newPos = getRandomPosition();
            setPosition(fromElement, newPos);
            
            // Show the other title
            toElement.classList.add('active');
            
            // Reset animation flag after transition
            setTimeout(() => {
                isAnimating = false;
            }, 1200); // Match transition duration
        }, 600);
    }

    // Function to show random title initially
    function initializeTitles() {
        // Set initial positions
        setPosition(titleA, getRandomPosition());
        setPosition(titleB, getRandomPosition());

        // Show random title
        const initialTitle = Math.random() > 0.5 ? titleA : titleB;
        initialTitle.classList.add('active');
    }

    // Mouse enter handlers
    titleA.addEventListener('mouseenter', () => {
        if (titleA.classList.contains('active')) {
            switchTitles(titleA, titleB);
        }
    });

    titleB.addEventListener('mouseenter', () => {
        if (titleB.classList.contains('active')) {
            switchTitles(titleB, titleA);
        }
    });

    // Initialize on load
    initializeTitles();
});

// PDF Viewer System
let pdfDoc = null;
let pageNum = 1;
let pdfViewer = null;
let isViewerInitialized = false;

async function initializePdfViewer() {
    if (isViewerInitialized) return;
    
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
        console.error('PDF.js library not loaded');
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const publiclyButton = document.querySelector('.title-a');
    const pdfModal = document.querySelector('#pdfModal');
    const closeButton = document.querySelector('.close-modal');
    
    if (!publiclyButton || !pdfModal || !closeButton) {
        console.error('Required PDF viewer elements not found:', {
            publiclyButton: !!publiclyButton,
            pdfModal: !!pdfModal,
            closeButton: !!closeButton
        });
        return;
    }

    publiclyButton.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Publicly button clicked');
        
        try {
            pdfModal.style.display = 'flex';
            
            if (!pdfDoc) {
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'pdf-loading';
                loadingIndicator.textContent = 'Loading PDF...';
                const modalContent = pdfModal.querySelector('.pdf-modal-content');
                modalContent.appendChild(loadingIndicator);

                console.log('Attempting to load PDF...');
                
                try {
                    const pdfPath = 'assets/portfolio.pdf';
                    console.log('Loading PDF from:', pdfPath);
                    
                    const response = await fetch(pdfPath);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const pdfData = await response.arrayBuffer();
                    console.log('PDF data received, size:', pdfData.byteLength);
                    
                    // Load PDF using PDF.js
                    const loadingTask = pdfjsLib.getDocument({data: pdfData});
                    console.log('PDF loading task created');
                    
                    pdfDoc = await loadingTask.promise;
                    console.log('PDF loaded successfully:', pdfDoc.numPages, 'pages');
                    
                    await loadPdf(pdfDoc);
                    
                    if (modalContent.contains(loadingIndicator)) {
                        modalContent.removeChild(loadingIndicator);
                    }
                } catch (error) {
                    console.error('Error loading PDF:', error);
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'pdf-error';
                    errorMessage.innerHTML = `
                        <h3>Unable to load PDF</h3>
                        <p>Error details: ${error.message}</p>
                        <p>Please ensure the PDF file exists at: assets/portfolio.pdf</p>
                    `;
                    
                    const modalContent = pdfModal.querySelector('.pdf-modal-content');
                    modalContent.innerHTML = '';
                    modalContent.appendChild(errorMessage);
                    modalContent.appendChild(closeButton);
                }
            }
        } catch (error) {
            console.error('Error in click handler:', error);
        }
    });

    closeButton.addEventListener('click', () => {
        pdfModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            pdfModal.style.display = 'none';
        }
    });

    isViewerInitialized = true;
    console.log('PDF viewer initialized');
}

async function loadPdf(pdf) {
    console.log('Starting to load PDF pages');
    const pdfContainer = document.querySelector('.pdf-container');
    if (!pdfContainer) {
        console.error('PDF container not found');
        return;
    }

    // Clear existing pages
    pdfContainer.innerHTML = `
        <div id="pdfViewer" class="swiper">
            <div class="swiper-wrapper" id="pdfPages"></div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
        </div>
    `;

    const pdfPages = document.getElementById('pdfPages');
    if (!pdfPages) {
        console.error('PDF pages container not found');
        return;
    }

    // Render all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Rendering page ${pageNum}`);
        const page = await pdf.getPage(pageNum);
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Calculate scale to fit the container
        const containerWidth = pdfContainer.clientWidth - 40;
        const containerHeight = pdfContainer.clientHeight - 40;
        const viewport = page.getViewport({ scale: 1.0 });
        
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledViewport = page.getViewport({ scale });
        
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        try {
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            slide.appendChild(canvas);
            pdfPages.appendChild(slide);
        } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
        }
    }

    console.log('All pages rendered, initializing Swiper');

    // Initialize Swiper
    if (window.Swiper) {
        if (pdfViewer) {
            pdfViewer.destroy();
        }
        pdfViewer = new Swiper('#pdfViewer', {
            direction: 'horizontal',
            loop: false,
            pagination: {
                el: '.swiper-pagination',
                type: 'fraction'
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            }
        });
        console.log('Swiper initialized');
    } else {
        console.error('Swiper not found');
    }
}

// Initialize PDF viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePdfViewer);

// 拖拽功能
document.addEventListener('DOMContentLoaded', () => {
    const draggable = document.querySelector('.draggable');
    const chainContainer = document.querySelector('.chain-container');
    const chainPaths = document.querySelector('.chain-paths');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let startPoint = { x: 0, y: 0 };
    let chainPoints = [];
    const maxChainPoints = 10;

    // 重置位置到初始状态
    localStorage.removeItem('aboutPosition');
    draggable.style.transform = '';
    
    // 清除所有已存在的路径
    chainPaths.innerHTML = '';

    function createChainPath() {
        const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        newPath.setAttribute('class', 'chain-path');
        chainPaths.appendChild(newPath);
        return newPath;
    }

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
            startPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            startPoint = { x: e.clientX, y: e.clientY };
        }

        if (e.target === draggable) {
            isDragging = true;
            draggable.classList.add('dragging');
            chainPoints = [{x: startPoint.x, y: startPoint.y}];
            createChainPath(); // 创建新的路径
        }
    }

    function dragEnd(e) {
        if (!isDragging) return;
        
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        draggable.classList.remove('dragging');
        chainPoints = [];

        // 保存位置到localStorage
        localStorage.setItem('aboutPosition', JSON.stringify({
            x: xOffset,
            y: yOffset
        }));
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
            chainPoints.push({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            chainPoints.push({
                x: e.clientX,
                y: e.clientY
            });
        }

        if (chainPoints.length > maxChainPoints) {
            // 当点数超过最大值时，创建新的路径
            createChainPath();
            chainPoints = chainPoints.slice(-2); // 保留最后两个点以保持连续性
        }

        xOffset = currentX;
        yOffset = currentY;
        setTranslate(currentX, currentY, draggable);
        updateChainPath();
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    function updateChainPath() {
        if (chainPoints.length < 2) return;

        const currentPath = chainPaths.lastElementChild;
        let path = `M ${chainPoints[0].x} ${chainPoints[0].y}`;
        
        for (let i = 1; i < chainPoints.length - 1; i++) {
            const xc = (chainPoints[i].x + chainPoints[i + 1].x) / 2;
            const yc = (chainPoints[i].y + chainPoints[i + 1].y) / 2;
            path += ` Q ${chainPoints[i].x} ${chainPoints[i].y} ${xc} ${yc}`;
        }

        const last = chainPoints[chainPoints.length - 1];
        path += ` L ${last.x} ${last.y}`;
        
        currentPath.setAttribute('d', path);
    }

    // 添加事件监听器
    draggable.addEventListener("touchstart", dragStart, false);
    draggable.addEventListener("touchend", dragEnd, false);
    draggable.addEventListener("touchmove", drag, false);

    draggable.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mousemove", drag, false);
    document.addEventListener("mouseup", dragEnd, false);
});

// lt页面交互
document.addEventListener('DOMContentLoaded', function() {
    const titleB = document.querySelector('.title-b');
    const ltPage = document.querySelector('.lt-page');
    const aboutLink = document.querySelector('.nav-links .draggable');
    
    if (titleB && ltPage && aboutLink) {
        titleB.addEventListener('click', function() {
            ltPage.classList.add('active');
            aboutLink.style.opacity = '0';
            aboutLink.style.visibility = 'hidden';
        });
        
        ltPage.addEventListener('click', function() {
            ltPage.classList.remove('active');
            aboutLink.style.opacity = '1';
            aboutLink.style.visibility = 'visible';
        });
    }
});

// GT页面交互
document.addEventListener('DOMContentLoaded', () => {
    const gtFrames = document.querySelectorAll('.gt-frame');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 如果是视频元素，确保视频播放
                const video = entry.target.querySelector('video');
                if (video) {
                    video.play().catch(e => console.log('Video autoplay prevented:', e));
                }
            }
        });
    }, {
        threshold: 0.3
    });

    gtFrames.forEach(frame => {
        observer.observe(frame);
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.gt-frame').forEach(frame => {
    observer.observe(frame);
}); 