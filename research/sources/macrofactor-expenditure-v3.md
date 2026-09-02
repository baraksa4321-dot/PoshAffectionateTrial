# Source: MacroFactor expenditure

URL: https://macrofactor.com/expenditure-v3/

Manage cookie consent

To provide the best experiences, we use technologies like cookies to store and/or access device information. Consenting to these technologies will allow us to process data such as browsing behavior or unique IDs on this site. Not consenting or withdrawing consent, may adversely affect certain features and functions.

FunctionalFunctional
Always active

The technical storage or access is strictly necessary for the legitimate purpose of enabling the use of a specific service explicitly requested by the subscriber or user, or for the sole purpose of carrying out the transmission of a communication over an electronic communications network.

PreferencesPreferences

The technical storage or access is necessary for the legitimate purpose of storing preferences that are not requested by the subscriber or user.

StatisticsStatistics

These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.The technical storage or access that is used exclusively for anonymous statistical purposes. Without a subpoena, voluntary compliance on the part of your Internet Service Provider, or additional records from a third party, information stored or retrieved for this purpose alone cannot usually be used to identify you.

MarketingMarketing

The technical storage or access is required to create user profiles to send advertising, or to track the user on a website or across several websites for similar marketing purposes.

- [Manage options](https://macrofactor.com/cookie-notice/#cmplz-manage-consent-container)
- [Manage services](https://macrofactor.com/cookie-notice/#cmplz-cookies-overview)
- [Manage {vendor\_count} vendors](https://macrofactor.com/cookie-notice/#cmplz-tcf-wrapper)
- [Read more about these purposes](https://cookiedatabase.org/tcf/purposes/)

AcceptDenyView preferencesSave preferences [View preferences](https://macrofactor.com/cookie-notice/#cmplz-manage-consent-container)

- [Cookie Policy](https://macrofactor.com/cookie-notice/)
- [Privacy Statement](https://privacy.macrofactor.com/)
- [Imprint](https://macrofactor.com/imprint/)

[Skip to content](https://macrofactor.com/expenditure-v3/#content)

# An In-Depth Look at MacroFactor’s New V3 Expenditure Algorithm

The expenditure algorithm is at the heart of the MacroFactor coaching system. Version 3 of the algorithm is more responsive, stable, accurate, and resilient to missing data.

- By
Greg Nuckols
- •[Product Press](https://macrofactor.com/product-press/)

- Updated October 8, 2024

![Expenditure V3](https://macrofactor.com/wp-content/uploads/2024/10/Expenditure-V3-featured-images.png)

The MacroFactor [expenditure](https://help.macrofactor.com/en/articles/20-expenditure) algorithm V3 is here, and we’re excited for you to try it out.

The expenditure algorithm is at the heart of the MacroFactor coaching system. It’s what [allows the app to adjust](https://help.macrofactor.com/en/articles/222-how-does-macrofactor-make-adjustments-for-a-weight-gain-or-weight-loss-goal) your weekly Calorie and macronutrient targets to [keep you on track](https://help.macrofactor.com/en/articles/125-how-does-dynamic-maintenance-work-in-macrofactor) toward your goals. Its power comes from the fact that it relies on solid physiological principles to be inherently self-correcting, unlike energy expenditure estimates coming from [static calculations](https://macrofactor.com/problems-with-calorie-counting/) or [wearable devices](https://macrofactor.com/wearables/). If you eat 2500 Calories per day and maintain your weight, that means you burn around 2500 Calories per day. If you gain weight while eating 2500 Calories per day, that means you burn less than 2500 Calories; if you lose weight, that means you burn more than 2500 Calories. And, if you lose weight slowly, that means you only burn slightly more than 2500 Calories; whereas if you lose weight very rapidly, that means you burn way more than 2500 Calories.

This is a simple concept that’s easy to grasp, but it gets a lot messier when you actually need to analyze data and estimate the energy expenditure of a given individual, based on their weight and nutrition information.

## Signal and noise – stability and responsiveness

The main problem is that nutrition and _especially_ weight data are noisy. In other words, they contain trends that can be used to accurately estimate your energy expenditure, but they also contain a lot of messiness that conceals those trends.

A basic principle of trend analysis is that you can’t simultaneously maximize both stability and responsiveness. If you zoom _way_ out, you can generate very stable predictions about the previous behavior of the noisy system. For example, if MacroFactor used an entire year of back-looking weight and nutrition data to estimate your expenditure, each new day of data would have relatively little impact on the analysis, resulting in an expenditure calculation that didn’t change much, thus providing very stable nutrition recommendations week to week. However, if your expenditure _did_ change considerably – if you started a new weight loss goal, if you switched from losing weight to intentionally bulking, or if your exercise and activity levels experienced a large shift – the app would be far too slow to adapt appropriately.

![Expenditure calculated from one year of data: very stable, but very slow to adapt](https://macrofactor.com/wp-content/uploads/2024/10/Fig-1-Expenditure-calculated-from-one-year-of-data_-very-stable-but-very-slow-to-adapt-3.png)_Comparing my expenditure calculated using V2 of the MacroFactor expenditure algorithm, to my expenditure calculated based on one year of retrospective weight and nutrition data. As you can see, day-to-day and week-to-week changes are considerably smaller with a super long analysis window, but this makes updates and adjustments far too slow if energy needs change._

On the flip side, analyzing just one week of data would result in a _very_ choppy experience due to the noisiness of the underlying data. For example, you might maintain a consistent lifestyle and eat 2500 Calories per day in back-to-back weeks, but in one week, you randomly gain two pounds, and in the next week, you lose those two pounds again. If you treated those two weeks as self-contained units, a naive analysis of your weight and nutrition data would suggest that you were burning about 1500 Calories per day in the first week, and about 3500 Calories per day in the second week. Clearly that’s absurd. But, if your actual energy expenditure _did_ change rapidly, this weekly analysis would adapt _far_ more quickly than a yearly analysis.

![ Expenditure calculated from one week of data: adapts quickly, but with more noise than signal](https://macrofactor.com/wp-content/uploads/2024/10/Fig-2-Expenditure-calculated-from-one-week-of-data-adapts-quickly-but-with-more-noise-than-signal.png)_Comparing my expenditure calculated using V2 of the MacroFactor expenditure algorithm, to my expenditure calculated based on just one week of retrospective weight and nutrition data. As you can see, this weekly calculation is very responsive to actual changes in my energy needs, but it’s also overly responsive to noisy weight data._

So, that’s the basic push and pull. I’m sure you don’t want your calorie targets increasing or decreasing by 500+ calories every week, but you also don’t want the app to take six months to adapt to a change in your diet or activity levels. However, analytical approaches that increase stability tend to decrease responsiveness, and analytical approaches that increase responsiveness tend to decrease stability. So, major algorithmic improvements – improvements that enhance stability without compromising responsiveness (like the jump from V1 and V2), that enhance responsiveness without compromising stability, or that simultaneously improve both responsiveness and stability – are surprisingly difficult.

## The first breakthrough: mitigating false signals

A challenge when dealing with weight data is that forward-looking predictions and back-looking calculations are often at odds.

Here’s what I mean:

If I told you that someone was previously weight-stable, and they started losing two pounds per week, would you predict that:

1. Their energy expenditure will decrease
2. Their energy expenditure won’t change
3. Their energy expenditure will increase

You’d _probably_ choose A: their energy expenditure will decrease. It’s well-understood that energy expenditure tends to decrease during weight loss, due to [metabolic adaptations](https://macrofactor.com/weight-loss-bmr/), decreases in non-exercise physical activity, and the simple fact that you’re now fueling a smaller body.

However, what if I told you instead that someone was previously weight-stable, they decreased their energy intake by just 250 Calories per day, and they started losing two pounds per week?

That would _imply_ that their energy expenditure was increasing. Losing two pounds per week requires a pretty large energy deficit – certainly much more than 250 Calories per day. So, their rate of weight loss, in combination with their nutrition data, would suggest that their energy expenditure was rising, rather than falling.

In a vacuum, you’d expect energy expenditure to increase with weight gain and decrease with weight loss, and you’d expect more rapid rates of weight gain to result in more rapid increases in energy expenditure, and more rapid rates of weight weight loss to result in more rapid decreases in energy expenditure. However, at any given level of energy intake, faster rates of weight gain imply lower total energy expenditures, and faster rates of weight loss imply higher total energy expenditures.

|     |     |     |
| --- | --- | --- |
| **Changes in energy expenditure as a result of weight change: predictions based on weight alone vs. implications when combined with nutrition data** |
|  | **Predictions based solely on weight change** | **Implications at a given level of energy intake** |
| **Weight gain** | Predicted Increase | Implied Decrease |
| **Weight loss** | Predicted Decrease | Implied Increase |
| **Faster rates of weight gain** | Faster Increase Predicted | Larger Decrease Implied |
| **Faster rates of weight loss** | Faster Decrease Predicted | Larger Increase Implied |

The time when this tension is felt most acutely is when starting a new weight gain or weight loss phase. When you shift from losing weight to gaining weight, it’s not uncommon to gain 5+ pounds _basically_ overnight. It’s not “real” weight gain – your body is just storing more glycogen (and associated water), and you have an increased amount of food (and associated water) in your digestive tract. The opposite occurs when you shift from gaining to losing weight – you might lose 5+ pounds within the first week or two, but again, that’s not 5 pounds of “real” weight loss (i.e. your body isn’t metabolizing 5 pounds of stored body fat) – it’s mostly water weight.

So, in these scenarios, your actual energy expenditure is likely to move in concert with your weight – increasing as you gain weight, and decreasing as you lose weight. But, when these large shifts in weight are analyzed in the context of more modest increases or decreases in energy intake, that would (erroneously) lead you to conclude that people initially experience a large decrease in energy expenditure when they start gaining weight, and a large increase in energy expenditure when they start losing weight.

This is a challenge we’re well-aware of, and [V2 of the expenditure algorithm](https://macrofactor.com/mm-july-2022/) used some clever tricks to mitigate the counterintuitive and frustrating impact of these large, short-term weight shifts on users’ calculated expenditure. But, we knew this was an area where we had room for improvement, and it seemed like an instance where we might be able to “beat” the typical stability versus responsiveness tradeoff, since we understood the exact way and the typical degree to which naive calculations would depart from physiological reality.

Ultimately, this is where the breakthrough originated. To avoid giving away our “secret sauce,” I don’t think I should divulge any more details, because they would necessarily hint at some of the novel techniques we developed. But, we soon realized that our solution to this limited problem generalized to other common and frustrating scenarios that dieters and athletes often face. From there, we found that these new techniques also performed better than expenditure V2 on synthetic datasets and our own data exports, and we finally realized we were dealing with a pretty significant leap forward. The techniques we developed allow V3 of the expenditure algorithm to be slightly more responsive than V2 (picking up on upward or downward trends that prove to be real and durable 1-5 days sooner than V2), while also being considerably more stable: day-to-day expenditure updates are generally about 35% smaller.

To illustrate, here’s about 2 years of my expenditure data with both the V2 and V3 algorithms.

![Comparing Expenditure V3 to Expenditure V2](https://macrofactor.com/wp-content/uploads/2024/10/Fig-3-Comparing-Expenditure-V3-to-Expenditure-V2-1.png)

Early on, my expenditure decreased quite a bit as I lost about 50 pounds. As you can see, both V2 and V3 picked up on the same long-term trend, but V3 did so with fewer and smaller bumps and detours along the way. V3 also wasn’t was impacted by this early weight loss plateau and subsequent “whoosh” of water weight:

![V was significantly less affected by a weight stall, followed by a subsequent “whoosh” of water weight](https://macrofactor.com/wp-content/uploads/2024/10/V3-was-significantly-less-affected-by-a-weight-stall-followed-by-a-subsequent-whoosh-of-water-weight.png)_As you can see, the V2 expenditure calculation decreased to a larger extent when my weight momentarily stalled, and increased to a greater degree when my weight suddenly dropped. V3 was considerably less affected by both occurrences._

Then, for about a year, I maintained my weight and maintained a pretty consistent lifestyle. V2 doesn’t do a _bad_ job of reflecting this fact – it never deviated by more than about 8-10% above or below the long-term trend. But, V3 did a better job of maintaining a more stable calculated expenditure during this period when, in hindsight, I know my energy expenditure was actually very stable. As you can see, the peaks aren’t as high and the valleys aren’t as low with V3.

Finally, any time there _were_ significant trend reversals, V3 picked up on them _about_ three days sooner than V2.

![V is more responsive, picking up on trend reversals a few days before V](https://macrofactor.com/wp-content/uploads/2024/10/V3-is-more-responsive-picking-up-on-trend-reversals-a-few-days-before-V2.png)_The large points indicate local maxima or minima at the time of significant trend reversals. V3 “peaked” or “bottomed out” 2-4 days before V2, indicating that it’s slightly quicker to pick up on trend changes, despite also being more stable overall._

Overall, the situations where V2 and V3 differ the most are situations where short-term weight fluctuations would lead to inferences about expenditure changes that differ from more reliable trends. So, the following scenarios will have a smaller impact on your estimated expenditure with V3 of the expenditure algorithm:

1. Momentary fluid retention from a carb- and salt-rich meal
2. An increase in fluid retention from starting creatine supplementation
3. Momentary fluid retention associated with ovulation or menses
4. Momentary fluid losses from reducing carb intake
5. Getting a big water weight “whoosh” after a weight stall
6. Shedding water weight that was previously retained during ovulation or menses

## The second breakthrough: handling missing data

After recognizing that we were dealing with an entirely new version of the expenditure algorithm, the boring work began. _Eureka_ moments are exciting, but they’re followed by months of fine-tuning, prodding at edge cases, and meticulously testing the limits of data quality and completeness the algorithm can handle before it starts behaving in non-ideal ways.

But, during this process, we happened to stumble across an unforeseen benefit of one of the analytical techniques we developed for V3 of the expenditure algorithm: with a small tweak, it could be adapted to allow the algorithm to be _far_ more tolerant of missing data.

When doing robustness testing on V2 of the expenditure algorithm, we found that we needed about 80-85% nutrition data completeness for the algorithm to still perform well and produce accurate updates. If the algorithm continued trying to update with more than one day of missing nutrition data per week, its performance would start dropping rapidly. So, with two or more days of missing nutrition data per seven-day period, we found it was simply better to pause updates until data completeness returned to an acceptable level (i.e., until the most recent seven-day period included at least six days of nutrition data).

However, V3 can still perform admirably with about three times as much missing data. Below, you can see the result of using a random number generator to delete half of my nutrition data at random (basically just a fancy automated coinflip, where I keep a day of nutrition data if it lands on heads, and delete it if it lands on tails). I performed the procedure 10 times, and you can see how my expenditure calculation would look each time, compared to my “real” calculation with 100% nutrition data completeness.

![Expenditure V remains quite stable and accurate even with % missing nutrition data](https://macrofactor.com/wp-content/uploads/2024/10/Expenditure-V3-remains-quite-stable-and-accurate-even-with-50-missing-nutrition-data.png)

As you can see, it still does quite well. With half of my nutrition data missing, the algorithm may be slightly more conservative with adjustments during periods when my expenditure was increasing or decreasing fairly quickly, but it never deviated too far from the “real” calculation, and it never behaved erratically by increasing or decreasing way more than it “should” have. And keep in mind, with this “coinflip” approach to deleting data, there would be instances where the “coin” landed on “tails” for 5+ days in a row, so there are plenty of weeks with two or fewer days of nutrition data in these simulations.

Now, to be clear, I ran this test using the “raw” version of the algorithm with no guardrails whatsoever. In practice, we found that pausing updates could still be helpful in certain contexts. But, with expenditure V3, updates will only pause if you have more than three days of missing nutrition data in a seven-day period.

Though V3 of the expenditure algorithm is more tolerant of missing data, we _do_ still generally recommend trying to [log](https://help.macrofactor.com/en/articles/201-how-accurately-do-i-need-to-log-my-food) or [estimate](https://help.macrofactor.com/en/articles/200-what-should-i-do-when-i-cant-accurately-log-a-meal) your intake whenever possible. But, V3 of the expenditure algorithm is able to handle missing data better because it can make reasonably accurate inferences about your energy intake on days you don’t log. We can compare its behind-the-scenes calorie predictions (how much it would estimate people ate if they _didn’t_ log their food for the day) against people’s _actual_ intake on the days they _did_ log, and we find that its energy intake estimates are generally within about 15-20% of the actual values (which is _why_ expenditure V3 can still provide accurate expenditure updates with significant amounts of missing nutrition data).

![Distribution of calorie estimation relative errors](https://macrofactor.com/wp-content/uploads/2024/10/Distribution-of-calorie-estimation-relative-errors.png)_Histogram of relative energy intake estimation errors that would have occurred if someone didn’t log their nutrition. The average error is around 13%, and >90% of errors are below 30%._

So, if there are some occasional days where you currently log your food but you _really_ would prefer not to –  when you’re on vacation, on holidays, when you plan to have a big night out with friends, etc. – V3 of the expenditure algorithm will better accommodate you. It’ll know if you ate a bit more or a bit less than normal, and it’ll have a pretty good idea of how much more or less than normal you ate on days you don’t log. This allows MacroFactor to more accurately calculate your expenditure, and pause your expenditure updates less frequently during periods when you don’t log your food every day. Though, you _do_ still need to be mindful to [avoid partial logging](https://help.macrofactor.com/en/articles/241-what-is-partial-logging).

## Your estimated expenditure will probably be a bit lower (and that’s a good thing)

We caught and corrected a small bug that was present in previous versions of the expenditure algorithm.

To explain how it got there, I first need to explain a little bit about the energy surpluses and deficits required to gain or lose weight.

You may have heard of the “3500 Calorie rule” – the idea that a total deficit of 3500 Calories is required to lose 1 pound, and a total surplus of 3500 Calories is required to gain one pound.

The 3500 Calorie rule is a decent general heuristic, but it’s not _strictly_ true in all cases. Fat has an energy density of about [39.5MJ/kg](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2376744/) (or about 4282 Calories per pound), and lean tissue has an energy density of about [7.6MJ/kg](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2376744/) (or about 824 Calories per pound). So, the “3500 Calorie rule” tacitly assumes that, when you gain or lose weight, about 78% of the weight you gain or lose is fat tissue, and about 22% of the weight you gain or lose is lean tissue.

Those aren’t bad assumptions in many situations, but there are also situations where they can deviate from reality. For example, if you start lifting weights and gain a pound of muscle without gaining _any_ fat, gaining that pound only required a total energy surplus of about 824 Calories, not 3500. You could even gain two pounds of muscle, lose a pound of fat, and wind up gaining a pound of body weight while being in a net energy _deficit_ of 2643 Calories.

So, we tried to apply that information to be a bit clever. Most people who use MacroFactor with a weight gain goal are actively exercising, and exercising has a dramatic impact on the composition of the weight you gain. At most reasonable rates of weight gain, instead of predominantly gaining fat as you gain weight, you predominantly gain muscle as you gain weight. So, that was baked into the assumptions of V1 and V2 of our algorithms: the surplus implied by gaining X pounds per week was smaller than the deficit implied by losing X pounds per week.

However, we realized that this set of assumptions – while technically correct in a vacuum – could have some unintended consequences. Namely, it led to small but consistent overestimates in users’ calculated expenditures as a result of weight fluctuations. Just to illustrate, if your energy intake is stable and your weight is relatively stable, but you lose 0.5lbs in a week, that suggests that you may be burning a bit more energy than you’re consuming, so your estimated expenditure needs to increase a bit. If you regain that same 0.5lbs the next week, that suggests that you may be burning a bit less energy than you’re consuming, so your estimated expenditure needs to decrease a bit. But, if we assume that the energy expenditure implied by a given rate of weight loss is larger than the surplus implied by a given rate of weight gain, the estimated expenditure increase in week 1 would be a bit larger than the estimated expenditure decrease in week 2. Extrapolate that out over time, and you wind up with a _slight_ upward bias.

I ran a quick simulation to illustrate this effect. In this simulation, the individual has a constant energy expenditure of 2500 Calories per day, they eat 2500 Calories per day, and they’re as weight-stable as anyone could ever hope to be: they weigh 200lbs, and experience totally normal, totally random weight fluctuations with a standard deviation of ±1 pound (in other words, their scale weight is between 199 and 201lbs about 2/3rds of the time, and between 198 and 202lbs about 95% of the time). Here are the results:

![Frame](https://macrofactor.com/wp-content/uploads/2024/10/Frame-9.png)

As you can see, assuming that the energy surplus implied by gaining weight at a given rate is smaller than the energy deficit implied by losing weight at the same rate (blue line) leads to a small but consistent overestimate of energy expenditure. The effect is small (about 80 Calories), but it’s persistent. However, assuming that the energy surplus implied by gaining weight is equivalent to the energy deficit implied by losing weight (red line) leads to an estimate of energy expenditure that never strays too far from the truth (2500 Calories per day).

With larger typical weight fluctuations, the resulting overestimate is larger, and with smaller weight fluctuations, the effect is smaller. Furthermore, if you’re consistently losing weight, the effect is smaller, and if you’re consistently gaining weight, the effect is larger.

So, we corrected this issue in V3 of the expenditure algorithm. As a result, _most_ people will have an estimated energy expenditure that’s a bit lower with V3 than with V2.

Depending on the magnitude of your typical weight fluctuations, and whether you’re gaining, losing, or maintaining weight, the independent impact of this change should be _around_ 0-130 Calories per day for most people. You personally might experience a larger decrease, or you might even experience an increase in your estimated expenditure when switching from V2 to V3, but any additional impact would be the result of smoothing out the larger periodic fluctuations present in V2. In my data above, my estimated expenditure with V3 is, on average, about 23 Calories lower than with V2. But, it was up to 215 Calories lower at one point, and up to 120 Calories higher at another point, since the periodic fluctuations are so much larger in V2 than V3.

## These changes have additional upsides for people with weight gain goals

If you have a weight gain goal, you may be concerned that this change will lead to less accurate nutrition recommendations for bulking. In the previous section, I explained that gaining weight consisting primarily of muscle mass _does_ require a smaller energy surplus than the energy deficit required to lose weight (primarily consisting of fat mass) at the same rate. But, the impact of this change fully washes out for you.

To illustrate, let’s assume that you’re gaining half a pound per week while consuming 3000 Calories per day, and you want to keep gaining half a pound per week.

If we assume that you’re gaining 100% muscle mass, that would imply that you’re in an energy surplus of just 59 Calories per day, and your energy expenditure is 2941 Calories per day. So, how much do you need to eat to keep gaining half a pound per week? 3000 Calories per day.

If we assume that the 3500 Calorie rule applies (in other words, tacitly assuming that you’re gaining predominantly fat), that would imply that you’re in an energy surplus of 250 Calories per day, and your energy expenditure is 2750 Calories per day. So, how much do you need to eat to keep gaining half a pound per week? You guessed it: 3000 Calories per day.

In other words, your estimated energy expenditure will be a bit lower, but the implied energy surplus required to keep gaining weight at your desired rate will also be higher, and those two changes will fully cancel each other out, resulting in the same Calorie recommendations for your desired rate of weight gain.

In fact, this change actually comes with even more upside for people who are using MacroFactor to gain weight. Previously, some users reported that MacroFactor seemed to be a bit too conservative with Calorie increases for people with weight gain goals. In hindsight, that _should_ have been foreseeable – a slower rate of Calorie increases was an unintended consequence of assuming that gaining weight at X rate implied a smaller energy surplus than the energy deficit implied by losing weight at X rate.

To illustrate, let’s assume that someone currently has a calculated expenditure of 2500 Calories per day, they want to lose a pound per week, and a cumulative energy deficit of 3500 Calories is required to lose a pound. To lose a pound per week, they need to be in a daily deficit of 500 Calories, so we’d recommend that they aim to consume 2000 Calories per day. But, if they start eating 2000 Calories per day, and they only lose half a pound per week, that would imply that their energy expenditure has decreased, and may be closer to 2250 Calories per day. Since their data suggests there’s a fairly large gap (250 Calories) between the expenditure implied by their current energy intake and rate of weight loss (2250 Calories per day), and our previous estimate of their energy expenditure (2500 Calories per day), their calculated energy expenditure – and therefore their energy intake recommendations – will decrease fairly quickly.

Now, let’s assume that someone currently has a calculated expenditure of 2500 Calories per day, they want to _gain_ a pound per week, and a cumulative energy surplus of just 2000 Calories is required to gain a pound. To gain a pound per week, they need to be in a daily surplus of 286 Calories, so we’d recommend that they aim to consume 2786 Calories per day. But, if they start eating 2786 Calories per day, and they only gain half a pound per week, that would imply that their energy expenditure has increased, and may be closer to 2643 Calories per day. Since their data suggests there’s a smaller gap (143 Calories) between the expenditure implied by their current energy intake and rate of weight gain (2643 Calories per day), and our previous estimate of their energy expenditure (2500 Calories per day), their calculated energy expenditure – and therefore their energy intake recommendations – will increase at a slower rate than the rate at which energy intake recommendations would decrease in the weight loss example above.

![Calculated expenditure will decrease faster than it can increase when the deficit implied by a given rate of weight loss is larger than the surplus implied by the same rate of weight gain](https://macrofactor.com/wp-content/uploads/2024/10/Calculated-expenditure-will-decrease-faster-than-it-can-increase-when-the-deficit-implied-by-a-given-rate-of-weight-loss-is-larger-than-the-surplus-implied-by-the-same-rate-of-weight-gain.png)

But, if we change one assumption – gaining a pound requires an energy surplus of 3500 Calories, rather than 2000 Calories – that difference goes away. The rate at which energy intake recommendations will increase when people fall short of their desired rate of weight gain will be the same as the rate at which energy intake recommendations will decrease when people fall short of their desired rate of weight loss.

![With mirrored assumptions about deficits and surpluses, expenditure can increase and decrease at the same rate](https://macrofactor.com/wp-content/uploads/2024/10/With-mirrored-assumptions-about-deficits-and-surpluses-expenditure-can-increase-and-decrease-at-the-same-rate.png)

## Just how well do MacroFactor’s algorithms work?

At the most basic level, MacroFactor’s algorithms work by making predictions, monitoring how well observed outcomes conform to those predictions, and then updating those predictions based on the observed differences between predictions and outcomes. To illustrate, if MacroFactor estimates that you have an energy expenditure of 2500 Calories per day, and you consistently eat 2000 Calories per day, it would _predict_ that you’ll lose weight at a rate of about 1 pound per week. But, if it then _observes_ that you’re actually losing weight at a rate of 1.2 pounds per week, that would imply that its prior prediction was a slight underestimate, and your energy expenditure is likely greater than 2500 Calories per day, so your estimated energy expenditure will increase.

To judge how well MacroFactor’s algorithms work, we can retroactively compare its predictions to subsequent outcomes. Just to provide an example, in June of 2021, I consumed an average of 2960 Calories per day, and MacroFactor estimated that my energy expenditure was about 3380 Calories per day. At that level of energy intake, MacroFactor would predict that I should lose about 3.6 pounds that month, given its estimate of my energy expenditure. In fact, I lost about 3.4 pounds that month. Since MacroFactor’s predictions were quite accurate, my estimated energy expenditure didn’t change very much. But, if I would have lost 7 pounds, my estimated expenditure would have increased by quite a bit, and if I only lost 1 pound, my estimated expenditure would have decreased by quite a bit.

There are various ways you could analyze and quantify the accuracy of MacroFactor’s predictions (and by extension, the accuracy of its nutrition recommendations): Do you look at a week of data? A month of data? Do you look at average error? Root mean square error? Mean absolute percentage error? Correlation coefficients? We look at all of those things, and this section _almost_ turned into a litany of numbers that some people wouldn’t understand, and even fewer people would care about. But, as the old saying goes: a picture is worth a thousand words (and maybe a thousand numbers). So, here it is: this is my actual weight data from the past 3 years, overlaid with how MacroFactor’s V3 expenditure algorithm predicted that my weight would change on a rolling weekly basis, given its estimates of my energy expenditure, and my actual energy intake. I think it speaks for itself.

![Comparing my actual weight to MacroFactor’s predictions](https://macrofactor.com/wp-content/uploads/2024/10/Comparing-my-actual-weight-to-MacroFactors-predictions.png)_My actual weight data closely mirrors MacroFactor’s predictions of how my weight would change given my actual energy intake and MacroFactor’s estimates of my energy expenditure. This necessarily implies that MacroFactor’s estimates of my energy expenditure were very accurate._

Based on our testing, not only is the V3 expenditure algorithm both more responsive _and_ more stable than V2 – it’s also about 10% more accurate. The absolute errors in its predicted rates of weight change are about 15% smaller on a weekly basis, and about 5% smaller on a monthly basis.

## What’s next?

One final benefit of the V3 algorithm is that it’s structurally and functionally more modular and robust (both theoretically and practically) than V1 or V2 were. This means that it will be generally easier to modify and improve, and it means that it will more easily accommodate additional inputs without deviating from the core DNA that has defined all versions of MacroFactor’s expenditure calculation and coaching functionality. So, V3 is not only a big leap forward right now – it also gives us a stronger foundation to continue building and improving upon, which should accelerate the rate at which we’re able to innovate and make further progress in this domain.

Looking back, V1 of the expenditure algorithm is still better than anything we’ve seen from other apps in this space, and V2 was a sizable improvement over V1. With V3, we’re taking another big step forward, providing an even more accurate and more stable expenditure calculation to form the bedrock of MacroFactor’s one-of-a-kind coaching experience.

### Related articles

[![counting macros](https://macrofactor.com/wp-content/uploads/2024/12/MacroFactor-featured-images-300x200.png)](https://macrofactor.com/counting-macros/)

[Counting Macros: How to Log Your Food and Track Your Calories](https://macrofactor.com/counting-macros/)

Counting macros isn’t just about numbers — it’s about giving yourself the tools to better understand your food and how it supports your goals. In this beginner’s guide, you’ll learn tips and techniques for tracking your food and counting calories and macros.

January 3, 2025

[![MacroFactor featured images](https://macrofactor.com/wp-content/uploads/2025/05/MacroFactor-featured-images-300x200.png)](https://macrofactor.com/tips-exercising-deficit/)

[Tips for Exercising When in a Calorie Deficit](https://macrofactor.com/tips-exercising-deficit/)

This article shares practical tips on training more effectively while in a Calorie deficit. Whether you’re just starting out or already training hard, this advice will help you get the best out of your efforts (and not sabotage your fat loss journey).

May 7, 2025

[![Logging food and weight for loss](https://macrofactor.com/wp-content/uploads/2024/03/MacroFactor-featured-images-300x200.png)](https://macrofactor.com/logging-for-loss/)

[Logging for Loss: A Look at the Research on Logging Food and Weight](https://macrofactor.com/logging-for-loss/)

Does logging help with weight management? If so, is there a best way or method to maximize its benefits? This article dives into the research to see what it says about logging.

March 4, 2024

[![Considerations for Micronutrient Tracking: Precision and Difficulty](https://macrofactor.com/wp-content/uploads/2023/08/micro-3-300x169.png)](https://macrofactor.com/micronutrient-tracking/)

[Considerations for Micronutrient Tracking: Precision and Difficulty](https://macrofactor.com/micronutrient-tracking/)

In Part 3 of our five-part micronutrient article series, we discuss the (im)precision of micronutrient tracking and how to track micronutrients.

August 7, 2023

[![](https://macrofactor.com/wp-content/uploads/2026/06/MacroFactor-featured-images-3-300x200.png)](https://macrofactor.com/rest-times-between-sets/)

[Do Rest Times Matter for Performance or Muscle Growth?](https://macrofactor.com/rest-times-between-sets/)

This article looks at rest times between sets for strength and muscle growth, including what the research says and how you could save time without limiting performance.

June 16, 2026

Cookie preferences

Scroll to Top

ClosePrevious

![](https://macrofactor.com/expenditure-v3/)

![](https://macrofactor.com/expenditure-v3/)

Next