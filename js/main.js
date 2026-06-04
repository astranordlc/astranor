document.addEventListener("DOMContentLoaded", () => {

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.15
    });

    document.querySelectorAll(".card").forEach(card=>{
        observer.observe(card);
    });

    document.querySelectorAll("section").forEach(section=>{
        observer.observe(section);
    });

});
