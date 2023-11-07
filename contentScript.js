(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value } = obj;
        if (type === "NEW") {
            pageLoaded();
        }
    });
    let stopProcessing = true;
    let countNumberAddFriend = 0;
    async function startAuto(wrapper, parent, fbWraper) {
        const showCountLoop = document.createElement('div');
        showCountLoop.className = "count-loop";
        showCountLoop.textContent = countNumberAddFriend;
        wrapper.append(showCountLoop);
        async function inviteFriend() {
            parent.querySelector('div[aria-label="Mời"][role="button"][tabindex="0"]').click();
            await sleep(1000);
            const sMenu = document.querySelector('div.x1n2onr6.xcxhlts.x1fayt1i[role="menu"]');
            const sMenuItem = sMenu.querySelectorAll('div[role="menuitem"]');
            await sMenuItem[0].click();
            const modalInvite = await waitForElementWithAriaLabel("Mời bạn bè tham gia nhóm này");
            if (modalInvite) {
                const boxcontent = modalInvite.querySelector('div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.x1l7klhg.x1iyjqo2.xs83m0k.x2lwn1j.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1e4zzel');
                const elementSelector = 'div[aria-checked="false"][role="checkbox"][tabindex="0"]';
                await boxcontent.scrollTo(0, boxcontent.scrollHeight);
                await waitForElementHasLoadAndScroll(elementSelector, 0, boxcontent, 1)
                    .then(async () => {
                        //config number of user invite
                        await scrollForElementsAndContinue(boxcontent, elementSelector, 3).then(async () => {
                            const listItem = boxcontent.querySelectorAll(elementSelector);
                            async function processList() {
                                for (const element of listItem) {
                                    element.click();
                                    countNumberAddFriend++;
                                    showCountLoop.textContent = countNumberAddFriend;
                                    await sleep(200);
                                }
                            }
                            processList();
                            await sleep((listItem.length + 1 + 5) * 200);
                            const sendInviteButton = modalInvite.querySelector('div[aria-label="Gửi lời mời"][role="button"][tabindex="0"]');
                            sendInviteButton.click();
                        })
                    })
                    .catch((error) => {
                        console.log('Failed to load: ' + error);
                    });
            } else {
                console.log("Element not found within the maximum attempts.");
            }
        }
        let randomTime = 0;
        //loop 3 times then stop
        for (let index = 0; index < 3; index++) {
            await inviteFriend();
            //config time break 
            randomTime = getRandomInt(20, 60);
            console.log('Nghỉ ' + randomTime + ' Phút');
            await sleep(randomTime * 60000);
        }
    }

    async function waitForElementWithAriaLabel(label) {
        return new Promise((resolve) => {
            const checkInterval = 1000;
            const maxAttempts = 40;
            let attempts = 0;

            const check = () => {
                const element = document.querySelector(`div[aria-label="${label}"][role="dialog"]`);
                if (element) {
                    resolve(element);
                } else {
                    attempts++;
                    if (attempts < maxAttempts) {
                        setTimeout(check, checkInterval);
                    } else {
                        resolve(null);
                    }
                }
            };

            check();
        });
    }

    async function waitForElementHasLoadAndScroll(elementSelector, currentLength, parent) {
        return new Promise(async (resolve, reject) => {
            const checkInterval = 2000;
            const maxAttempts = 10;
            let attempts = 0;

            async function check() {
                if (parent) {
                    const elements = parent.querySelectorAll(elementSelector);
                    if (elements.length <= currentLength) {
                        attempts++;
                        if (attempts < maxAttempts) {
                            await sleep(checkInterval);
                            await check();
                        } else {
                            reject('Max attempts reached');
                        }
                    } else {
                        resolve();
                    }
                } else {
                    reject('Parent element not found');
                }
            }

            await check();
        });
    }

    async function scrollForElementsAndContinue(element, elementSelector, maxScrolls) {
        for (let i = 0; i < maxScrolls; i++) {
            element.scrollTo(0, element.scrollHeight);
            await waitForElementHasLoadAndScroll(elementSelector, element.querySelectorAll(elementSelector).length, element);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function stopAuto() {
        stopProcessing = true;
        window.location.reload(true);
    }

    function pageLoaded() {
        const fbWraper = document.getElementById('facebook');
        const parent = fbWraper.querySelector('div[aria-label="Mời"][role="button"][tabindex="0"]').parentElement;

        const wrapper = document.createElement('div');
        wrapper.className = "toogle-btn auto-invite-friend-btn";
        parent.append(wrapper);

        const bookmarkBtn = document.createElement("img");
        bookmarkBtn.src = chrome.runtime.getURL("assets/invite-friends-off.png");
        bookmarkBtn.className = "auto-img";
        bookmarkBtn.title = "Click to start auto";
        wrapper.append(bookmarkBtn);

        bookmarkBtn.addEventListener('click', (e) => {
            if (!stopProcessing) {
                bookmarkBtn.src = chrome.runtime.getURL("assets/invite-friends-off.png");
                bookmarkBtn.title = "Click to start auto";
                stopAuto();
            } else {
                bookmarkBtn.src = chrome.runtime.getURL("assets/invite-friends-on.png");
                bookmarkBtn.title = "Click to stop auto";

                stopProcessing = false;
                startAuto(wrapper, parent, fbWraper);
            }
        });
    }
    pageLoaded();
})();
