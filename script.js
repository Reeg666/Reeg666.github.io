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

// 技能条动画
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-progress').forEach(skill => {
    observer.observe(skill);
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

// PDF Viewer initialization
if (typeof pdfjsLib === 'undefined') {
    console.error('PDF.js library not loaded');
} else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let pdfSwiper = null;
let isInitialized = false;

function initializePdfViewer() {
    if (isInitialized) return;
    
    // 检查必要的DOM元素
    const modal = document.getElementById('pdfModal');
    const closeBtn = document.querySelector('.close-modal');
    const titleA = document.querySelector('.title-a');
    const pdfContainer = document.querySelector('.pdf-container');
    const pdfPages = document.getElementById('pdfPages');

    if (!modal || !closeBtn || !titleA || !pdfContainer || !pdfPages) {
        console.error('Missing required DOM elements for PDF viewer');
        return;
    }

    // Close modal when clicking the close button or outside the modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'pdf-loading';
    loadingIndicator.innerHTML = '加载中...';
    modal.appendChild(loadingIndicator);

    // Initialize PDF viewer
    async function loadPdf() {
        try {
            loadingIndicator.style.display = 'block';
            modal.style.display = "block";
            
            // 加载PDF文件
            const pdfPath = 'assets/portfolio.pdf';
            
            // 首先检查文件是否存在
            try {
                const response = await fetch(pdfPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const pdfData = await response.arrayBuffer();
                
                // 使用arrayBuffer加载PDF
                const loadingTask = pdfjsLib.getDocument({data: pdfData});
                const pdf = await loadingTask.promise;
                const pagesContainer = document.getElementById('pdfPages');
                pagesContainer.innerHTML = '';

                // Create slides for each page
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    pagesContainer.appendChild(slide);

                    const page = await pdf.getPage(pageNum);
                    // 计算适合容器的缩放比例
                    const containerWidth = pdfContainer.clientWidth - 40;
                    const containerHeight = pdfContainer.clientHeight - 40;
                    const viewport = page.getViewport({ scale: 1.0 });
                    
                    // 计算缩放比例
                    const scaleX = containerWidth / viewport.width;
                    const scaleY = containerHeight / viewport.height;
                    const scale = Math.min(scaleX, scaleY);
                    
                    // 使用计算出的缩放比例
                    const scaledViewport = page.getViewport({ scale });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = scaledViewport.height;
                    canvas.width = scaledViewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: scaledViewport
                    };

                    await page.render(renderContext).promise;
                    slide.appendChild(canvas);
                }

                // Initialize or update Swiper
                if (pdfSwiper) {
                    pdfSwiper.destroy();
                }
                
                pdfSwiper = new Swiper('#pdfViewer', {
                    direction: 'horizontal',
                    loop: false,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev'
                    }
                });

            } catch (error) {
                console.error('Error loading PDF:', error);
                if (error.message.includes('HTTP error')) {
                    alert('无法找到PDF文件，请确保文件已正确放置在assets目录中');
                } else {
                    alert('PDF文件加载失败：' + error.message);
                }
                throw error; // 继续向上传播错误
            }

        } catch (error) {
            console.error('Error in PDF viewer:', error);
            alert('PDF查看器初始化失败，请刷新页面重试');
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    // Add click event to title-a
    titleA.addEventListener('click', () => {
        loadPdf();
    });

    isInitialized = true;
}

// Initialize when DOM is ready
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